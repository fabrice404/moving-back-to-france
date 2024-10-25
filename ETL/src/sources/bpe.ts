import * as cliProgress from "cli-progress";
import Debug from "debug";
import path from "path";

import * as io from "../lib/io";
import * as db from "../lib/db";

const debug = Debug("mbtf:ETL:sources/bpe");

const FACILITY_TYPES = {
  A133: "service_decheterie",
  A203: "service_banque",
  A206: "service_poste",
  A501: "commerce_coiffeur",

  B103: "commerce_bricolage",
  B104: "commerce_supermarche",
  B105: "commerce_supermarche",
  B204: "commerce_boucherie",
  B207: "commerce_boulangerie",
  B208: "commerce_primeur",
  B302: "commerce_vetements",
  B304: "commerce_chaussures",
  B306: "commerce_meubles",
  B307: "commerce_sports_loisirs",
  B313: "sante_opticien",

  C107: "education_maternelle",
  C108: "education_primaire",
  C109: "education_primaire",
  C201: "education_college",
  C301: "education_lycee",

  D106: "sante_urgences",
  D201: "sante_medecin",
  D208: "sante_opthalmologue",
  D214: "sante_gynecologue",
  D221: "sante_dentiste",
  D307: "sante_pharmacie",

  E102: "transport_aeroport",
  E107: "transport_gare",
  E108: "transport_gare",
  E109: "transport_gare",

  F101: "sport_piscine",
  F106: "sport_equitation",
  F303: "loisir_cinema",
  F307: "loisir_bibliotheque",
};

/**
 * Base Permanente des Equipements
 * https://www.insee.fr/fr/metadonnees/source/operation/s2155/presentation
 */
export const importData = async () => {
  debug("importData: reading from source file");
  const data = await io.readCSV(
    path.join(__dirname, "../../../data/BPE/DS_BPE_data.csv"),
    {
      delimiter: ";",
      matchPattern: /"FACILITIES";.*;"COM";/g,
      columnsToKeep: ["FACILITY_TYPE", "GEO", "OBS_VALUE"],
    },
  );

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
    const facilityType = FACILITY_TYPES[item.FACILITY_TYPE];

    if (facilityType) {
      queries.push(
        db.query(`
          INSERT INTO villes (code_insee, ${facilityType}) VALUES ($1, $2)
          ON CONFLICT (code_insee) DO UPDATE SET ${facilityType} = $2;
          `, [item.GEO, item.OBS_VALUE],
        ),
      );
    }
  }
  await Promise.all(queries);
  bar1.update(data.length);
  bar1.stop();
};
