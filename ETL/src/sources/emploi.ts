import * as cliProgress from "cli-progress";
import Debug from "debug";
import path from "path";

import * as io from "../lib/io";
import * as db from "../lib/db";

const debug = Debug("mbtf:ETL:sources/emploi");

/**
 * Emploi-population active
 * https://www.insee.fr/fr/statistiques/7632867
 */
export const importData = async () => {
  debug("importData: reading from source file");
  const data = await io.readCSV(
    path.join(__dirname, "../../../data/INSEE/base-cc-emploi-pop-active-2020_v2.csv"),
    {
      delimiter: ";",
      columnsToKeep: ["CODGEO", "P20_POP1564", "P20_ACT1564", "P20_ACTOCC1564", "P20_CHOM1564"],
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

    queries.push(
      db.query(`
        INSERT INTO villes (code_insee, emploi_population, emploi_actif, emploi_actif_occupe, emploi_actif_chomage) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (code_insee) DO UPDATE SET emploi_population = $2, emploi_actif = $3, emploi_actif_occupe = $4, emploi_actif_chomage = $5;
        `, [item.CODGEO, item.P20_POP1564.split(".").shift(), item.P20_ACT1564.split(".").shift(), item.P20_ACTOCC1564.split(".").shift(), item.P20_CHOM1564.split(".").shift()],
      ),
    );
  }
  await Promise.all(queries);
  bar1.update(data.length);
  bar1.stop();
};
