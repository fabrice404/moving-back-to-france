import * as cliProgress from "cli-progress";
import Debug from "debug";
import path from "path";

import * as io from "../lib/io";
import * as db from "../lib/db";

const debug = Debug("mbtf:ETL:sources/population");

/**
 * Population communale
 * https://www.insee.fr/fr/statistiques/3698339
 */
export const importData = async () => {
  debug("importData: reading from source file");
  const data = await io.readCSV(
    path.join(__dirname, "../../../data/INSEE/population-communale.csv"),
    {
      delimiter: ";",
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
        INSERT INTO villes (code_insee, nom, geo_population) VALUES ($1, $2, $3)
        ON CONFLICT (code_insee) DO UPDATE SET nom = $2, geo_population = $3;
        `, [item.CODGEO, item.LIBGEO, item.PMUN2021],
      ),
    );
  }
  await Promise.all(queries);
  bar1.update(data.length);
  bar1.stop();
};
