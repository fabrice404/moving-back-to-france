import * as cliProgress from "cli-progress";
import Debug from "debug";
import path from "path";

import * as io from "../lib/io";
import * as db from "../lib/db";
import * as utils from "../lib/utils";

const debug = Debug("mbtf:ETL:sources/code-postal-gps");

/**
 * Code postaux et données GPS
 * https://www.data.gouv.fr/en/datasets/correspondance-entre-les-codes-postaux-et-codes-insee-des-communes-francaises/
 */
export const importData = async () => {
  debug("importData: reading from source file");
  const data = JSON.parse(io.readFile(
    path.join(__dirname, "../../../data/ODS/correspondance-code-insee-code-postal.json"),
  ));

  debug("importData: importing data in database");
  const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar1.start(data.length, 0);
  let queries = [];

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (i % 1000 === 0) {
      await Promise.all(queries);
      queries = [];
      bar1.update(i);
    }
    const [code_postal] = item.postal_code.split("/");
    if (code_postal.length === 5) {
      queries.push(
        db.query(`
          INSERT INTO villes (code_insee, code_postal, geo_altitude, geo_latitude, geo_longitude, geo_superficie) VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (code_insee) DO UPDATE SET code_postal = $2, geo_altitude = $3, geo_latitude = $4, geo_longitude = $5, geo_superficie = $6;
          `, [item.insee_com, code_postal, item.z_moyen, item.geo_point_2d.lat, item.geo_point_2d.lon, parseFloat(item.superficie) / 100],
        ),
      );
    }
  }
  await Promise.all(queries);
  bar1.update(data.length);
  bar1.stop();

  debug("importData: aggregating data");
  const { rows: grandeVilles } = await db.query(`
    SELECT code_insee, geo_latitude, geo_longitude
    FROM villes
    WHERE geo_latitude IS NOT NULL
      AND geo_longitude IS NOT NULL
      AND geo_population >= 40000
    ORDER BY geo_latitude, geo_longitude;
  `);
  const { rows: villes } = await db.query(`
    SELECT code_insee, geo_latitude, geo_longitude
    FROM villes
    WHERE geo_latitude IS NOT NULL
      AND geo_longitude IS NOT NULL
    ORDER BY geo_latitude, geo_longitude;
  `);

  const bar2 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar2.start(villes.length, 0);
  for (let i = 0; i < villes.length; i++) {
    if (i % 100 === 0) {
      await Promise.all(queries);
      queries = [];
      bar2.update(i);
    }

    const villeA = villes[i];

    for (let j = i + 1; j < villes.length; j++) {
      if (j % 100 === 0) {
        await Promise.all(queries);
        queries = [];
      }
      const villeB = villes[j];
      const distance = utils.getDistance(villeA.geo_latitude, villeA.geo_longitude, villeB.geo_latitude, villeB.geo_longitude);
      if (distance <= 10) {
        queries.push(
          db.query(`
            INSERT INTO voisins (code_insee_1, code_insee_2, distance) VALUES ($1, $2, $3)
            ON CONFLICT (code_insee_1, code_insee_2) DO NOTHING;
            `, [villeA.code_insee, villeB.code_insee, distance],
          ),
        );
      }
    }
    await Promise.all(queries);

    let grandeVilleProcheCodeInsee: string = "";
    let grandeVilleProcheDistance = Number.MAX_VALUE;
    for (const grandeVille of grandeVilles) {
      const distance = utils.getDistance(villeA.geo_latitude, villeA.geo_longitude, grandeVille.geo_latitude, grandeVille.geo_longitude);
      if (distance < grandeVilleProcheDistance) {
        grandeVilleProcheCodeInsee = grandeVille.code_insee;
        grandeVilleProcheDistance = distance;
      }
    }

    if (grandeVilleProcheCodeInsee) {
      queries.push(
        db.query(`
          INSERT INTO villes (code_insee, geo_grande_ville_code_insee, geo_grande_ville_distance) VALUES ($1, $2, $3)
          ON CONFLICT (code_insee) DO UPDATE SET geo_grande_ville_code_insee = $2, geo_grande_ville_distance = $3;
          `, [villeA.code_insee, grandeVilleProcheCodeInsee, grandeVilleProcheDistance],
        ),
      );
    }
  }
  await Promise.all(queries);
  bar2.update(villes.length);
  bar2.stop();
};
