import parquetjs from "@dsnp/parquetjs";
import * as cliProgress from "cli-progress";
import Debug from "debug";
import path from "path";

import * as db from "../lib/db";

const debug = Debug("mbtf:ETL:sources/delinquance");

/**
 * Delinquance
 * https://www.data.gouv.fr/fr/datasets/bases-statistiques-communale-departementale-et-regionale-de-la-delinquance-enregistree-par-la-police-et-la-gendarmerie-nationales/
 */
export const importData = async () => {
  debug("importData: reading from source file");
  const reader = await parquetjs.ParquetReader.openFile(path.join(__dirname, "../../../data/data-gouv/delinquance.parquet"));

  debug("importData: cleaning database");
  await db.query(
    `UPDATE villes SET 
      delinquance_aggression = 0,
      delinquance_vol = 0,
      delinquance_cambriolage = 0,
      delinquance_stupefiant = 0,
      delinquance_autre = 0
    `,
  );

  debug("importData: importing data in database");
  const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar1.start(+reader.getRowCount(), 0);

  const cursor = reader.getCursor();
  let record: any;
  let i = 0;
  let queries = [];

  while (record = await cursor.next()) { // eslint-disable-line no-cond-assign
    if (i % 1000 === 0) {
      await Promise.all(queries);
      queries = [];
      bar1.update(i);
    }
    if (record.faits && record.faits !== "0" && record.annee === "23") {
      const { CODGEO_2024: codeInsee, classe } = record;
      const faits = parseInt(record.faits, 10);

      let column = "";
      if (classe.match(/coups|violences/gi)) {
        column = "delinquance_aggression";
      } else if (classe.match(/vols/gi)) {
        column = "delinquance_vol";
      } else if (classe.match(/cambriolage/gi)) {
        column = "delinquance_cambriolage";
      } else if (classe.match(/stupéfiants/gi)) {
        column = "delinquance_stupefiant";
      } else {
        column = "delinquance_autre";
      }

      queries.push(
        db.query(`
          UPDATE villes SET ${column} = ${column} + $1
          WHERE code_insee = $2
          `, [faits, codeInsee],
        ),
      );
    }
    i++;
  }
  await Promise.all(queries);
  await reader.close();
  bar1.update(i);
  bar1.stop();
};
