import * as cliProgress from "cli-progress";
import Debug from "debug";
import path from "path";

import * as io from "../lib/io";
import * as db from "../lib/db";

const debug = Debug("mbtf:ETL:sources/taxe-fonciere");

/**
 * Population communale
 * https://www.collectivites-locales.gouv.fr/taux-de-fiscalite-directe-votes-en-2023-par-les-communes-et-epci-fiscalite-propre
 */
export const importData = async () => {
  debug("importData: reading from source file");
  const data = await io.readCSV(
    path.join(__dirname, "../../../data/data-gouv/taxe-fonciere.csv"),
    {
      delimiter: ",",
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
        INSERT INTO villes (code_insee, geo_taxe_fonciere) VALUES ($1, $2)
        ON CONFLICT (code_insee) DO UPDATE SET geo_taxe_fonciere = $2;
        `, [item.CODGEO, item.TAXE_BATI],
      ),
    );
  }
  await Promise.all(queries);
  bar1.update(data.length);
  bar1.stop();
};
