import * as cliProgress from "cli-progress";
import Debug from "debug";
import path from "path";

import * as io from "../lib/io";
import * as db from "../lib/db";
import * as utils from "../lib/utils";

const debug = Debug("mbtf:ETL:sources/meteo");

/**
 * Données climatologiques de base - quoitidiennes
 * https://meteo.data.gouv.fr/datasets/6569b51ae64326786e4e8e1a
 */
export const importData = async () => {
  const stations: { [key: string]: any; } = {};
  let queries = [];

  for (let i = 1; i < 95; i++) {
    const departement = i.toString().padStart(2, "0");

    debug(`importData: reading from source file for departement ${departement}`);
    let data = await io.readCSV(
      path.join(__dirname, `../../../data/meteo-france/Q_${departement}_latest-2023-2024_RR-T-Vent.csv`),
      {
        delimiter: ";",
        columnsToKeep: ["NUM_POSTE", "NOM_USUEL", "LAT", "LON", "ALTI", "AAAAMMJJ", "RR", "TM", "TNTXM"],
      },
    );

    for (let i = 0; i < data.length; i++) {
      const item = data[i];

      if (!stations[item.NUM_POSTE]) {
        stations[item.NUM_POSTE] = {
          id: item.NUM_POSTE,
          nom: item.NOM_USUEL,
          latitude: item.LAT,
          longitude: item.LON,
          altitude: item.ALTI,
          mesures: [],
        };
      }
      if (item.AAAAMMJJ.startsWith("2023")) {
        stations[item.NUM_POSTE].mesures.push({
          date: item.AAAAMMJJ,
          precipitations: parseFloat(item.RR || 0),
          temperature_moyenne: parseFloat(item.TM || item.TNTXM),
        });
      }
    }

    data = await io.readCSV(
      path.join(__dirname, `../../../data/meteo-france/Q_${departement}_latest-2023-2024_autres-parametres.csv`),
      {
        delimiter: ";",
        columnsToKeep: ["NUM_POSTE", "NOM_USUEL", "LAT", "LON", "AAAAMMJJ", "INST", "HNEIGEF"],
      },
    );
    for (let i = 0; i < data.length; i++) {
      const item = data[i];

      if (item.AAAAMMJJ.startsWith("2023")) {
        const mesure = stations[item.NUM_POSTE]?.mesures.find((mesure: any) => mesure.date === item.AAAAMMJJ);
        if (mesure) {
          mesure.ensoleillement = parseInt(item.INST || 0, 10);
          mesure.enneigement = parseInt(item.HNEIGEF || 0, 10);
        }
      }
    }
  }

  debug("importData: importing data in database");
  const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar1.start(Object.keys(stations).length, 0);

  await db.query("TRUNCATE TABLE stations_meteo;");

  const defaultDataMois = {
    precipitations: 0,
    temperature_moyenne: 0,
    ensoleillement: 0,
    enneigement: 0,
    mesures: 0,
    jours_de_pluie: 0,
  };
  const defaultData = {
    ...defaultDataMois,
    temperature_hiver: 0,
    temperature_hiver_mesures: 0,
    temperature_ete: 0,
    temperature_ete_mesures: 0,
  };

  for (let i = 0; i < Object.keys(stations).length; i++) {
    const station = Object.values(stations)[i];
    if (i % 100 === 0) {
      await Promise.all(queries);
      queries = [];
      bar1.update(i);
    }
    const result = station.mesures.reduce((acc: any, mesure: any) => {
      acc.mesures++;
      acc.precipitations += mesure.precipitations;
      acc.temperature_moyenne += mesure.temperature_moyenne;
      acc.ensoleillement += mesure.ensoleillement;
      acc.enneigement += mesure.enneigement;
      acc.jours_de_pluie += mesure.precipitations > 0 ? 1 : 0;

      const moisJour = mesure.date.slice(4, 8);
      if (moisJour > "1221" || moisJour < "0321") {
        acc.temperature_hiver += mesure.temperature_moyenne;
        acc.temperature_hiver_mesures++;
      } else if (moisJour > "0621" && moisJour < "0921") {
        acc.temperature_ete += mesure.temperature_moyenne;
        acc.temperature_ete_mesures++;
      }

      const mois = mesure.date.slice(4, 6);
      acc.mois[mois].mesures++;
      acc.mois[mois].precipitations += mesure.precipitations;
      acc.mois[mois].temperature_moyenne += mesure.temperature_moyenne;
      acc.mois[mois].ensoleillement += mesure.ensoleillement;
      acc.mois[mois].enneigement += mesure.enneigement;
      acc.mois[mois].jours_de_pluie += mesure.precipitations > 0 ? 1 : 0;

      return acc;
    }, {
      ...defaultData,
      mois: {
        "01": { ...defaultDataMois },
        "02": { ...defaultDataMois },
        "03": { ...defaultDataMois },
        "04": { ...defaultDataMois },
        "05": { ...defaultDataMois },
        "06": { ...defaultDataMois },
        "07": { ...defaultDataMois },
        "08": { ...defaultDataMois },
        "09": { ...defaultDataMois },
        "10": { ...defaultDataMois },
        "11": { ...defaultDataMois },
        "12": { ...defaultDataMois },
      },
    });

    result.precipitations = Math.round(result.precipitations);
    result.temperature_moyenne = Math.round(result.temperature_moyenne / result.mesures * 10) / 10;
    Object.values(result.mois).forEach((mois: any) => {
      mois.precipitations = Math.round(mois.precipitations);
      mois.temperature_moyenne = Math.round(mois.temperature_moyenne / mois.mesures * 10) / 10;
    });
    result.temperature_ete = Math.round(result.temperature_ete / result.temperature_ete_mesures * 10) / 10;
    result.temperature_hiver = Math.round(result.temperature_hiver / result.temperature_hiver_mesures * 10) / 10;
    console.log(result.temperature_ete_mesures, result.temperature_hiver_mesures);
    if (
      !Number.isNaN(result.precipitations) &&
      !Number.isNaN(result.temperature_moyenne) &&
      !Number.isNaN(result.ensoleillement) &&
      !Number.isNaN(result.enneigement)
    ) {
      queries.push(
        db.query(`
          INSERT INTO stations_meteo (code, nom, geo_latitude, geo_longitude, geo_altitude, precipitations, temperature_moyenne, temperature_hiver, temperature_ete, ensoleillement, enneigement, jours_de_pluie, mesures)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) ON CONFLICT DO NOTHING;
          `, [station.id, station.nom, station.latitude, station.longitude, station.altitude, result.precipitations, result.temperature_moyenne, result.temperature_hiver, result.temperature_ete, result.ensoleillement, result.enneigement, result.jours_de_pluie, result.mesures],
        ),
      );
    }
  }
  await Promise.all(queries);
  bar1.update(Object.keys(stations).length);
  bar1.stop();

  debug("importData: linking city with closest station");
  queries = [];
  const { rows: villes } = await db.query("SELECT * FROM villes WHERE geo_latitude IS NOT NULL;");
  const { rows: stationsMeteo } = await db.query("SELECT * FROM stations_meteo WHERE geo_latitude IS NOT NULL AND mesures >= 365 AND jours_de_pluie > 0;");

  const bar2 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar2.start(villes.length, 0);
  for (let i = 0; i < villes.length; i++) {
    if (i % 100 === 0) {
      await Promise.all(queries);
      queries = [];
      bar2.update(i);
    }
    const ville = villes[i];
    let stationProcheCode: string = "";
    let stationProcheDistance = Number.MAX_VALUE;

    for (const station of stationsMeteo) {
      if (station.geo_altitude > ville.geo_altitude * 0.75 && station.geo_altitude < ville.geo_altitude * 1.25) {
        const distance = utils.getDistance(ville.geo_latitude, ville.geo_longitude, station.geo_latitude, station.geo_longitude);
        if (distance < stationProcheDistance) {
          stationProcheCode = station.code;
          stationProcheDistance = distance;
        }
      }
    }
    queries.push(db.query("UPDATE villes SET geo_station_meteo_code = $1 WHERE code_insee = $2;", [stationProcheCode, ville.code_insee]));
  }
  await Promise.all(queries);
  bar2.update(villes.length);
  bar2.stop();
};


