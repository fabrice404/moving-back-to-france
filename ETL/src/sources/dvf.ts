import * as cliProgress from "cli-progress";
import Debug from "debug";
import path from "path";

import * as io from "../lib/io";
import * as db from "../lib/db";

const debug = Debug("mbtf:ETL:sources/dvf");

/**
 * Demandes de Valeur Foncière
 * https://files.data.gouv.fr/geo-dvf/latest/csv/$YEAR/full.csv.gz
 */
export const importData = async () => {

  let queries = [];

  for (const year of [2022, 2023]) {
    debug(`importData: reading from source file ${year}`);
    const data = await io.readCSV(
      path.join(__dirname, `../../../data/data-gouv/dvf${year}.csv`),
      {
        matchPattern: /,Vente,.*,Maison,/g,
        columnsToKeep: ["id_mutation", "date_mutation", "code_commune", "valeur_fonciere", "surface_reelle_bati", "nombre_pieces_principales"],
      },
    );

    debug(`importData: importing data in database ${year}`);
    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar1.start(data.length, 0);

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (i % 1000 === 0) {
        await Promise.all(queries);
        queries = [];
        bar1.update(i);
      }

      if (!Object.values(item).some((v) => v == null || v === "")) {
        queries.push(
          db.query(`
        INSERT INTO ventes_immobilieres (id_vente, code_insee, prix, surface, pieces, date) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id_vente) DO NOTHING;
        `, [item.id_mutation, item.code_commune, Math.round(item.valeur_fonciere), item.surface_reelle_bati, item.nombre_pieces_principales, item.date_mutation],
          ),
        );
      }
    }
    await Promise.all(queries);
    bar1.update(data.length);
    bar1.stop();

  }

  debug("importData: aggregating data");
  const result = await db.query(`
    SELECT code_insee, ROUND(AVG(prix / surface)) AS prix_m2
    FROM ventes_immobilieres
    GROUP BY code_insee
  `);
  const bar2 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar2.start(result.rows.length, 0);

  queries = [];
  let i = 0;
  for (const row of result.rows) {
    if (i % 1000 === 0) {
      await Promise.all(queries);
      queries = [];
      bar2.update(i);
    }

    queries.push(
      db.query(`
        INSERT INTO villes (code_insee, geo_immobilier_prix_m2) VALUES ($1, $2)
        ON CONFLICT (code_insee) DO UPDATE SET geo_immobilier_prix_m2 = $2;
        `, [row.code_insee, row.prix_m2],
      ),
    );
    i++;
  }
  await Promise.all(queries);
  bar2.update(result.rows.length);
  bar2.stop();
};
