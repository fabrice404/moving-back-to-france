import Debug from "debug";


import * as db from "../lib/db";
import * as utils from "../lib/utils";

const debug = Debug("mbtf:API:services/shortlist");


export const getShortlist = async (): Promise<any> => {
  debug("getShortlist");

  const villes = await db.query(`
    SELECT shortlist_ville.*, villes.nom, villes.code_postal
    FROM shortlist_ville
      INNER JOIN villes ON villes.code_insee = shortlist_ville.code_insee
    ORDER BY villes.nom, villes.code_postal;
  `);

  const criteria = await db.query(`
    SELECT shortlist_criteria.*
    FROM shortlist_criteria
    ORDER BY sort;
  `);

  const values = await db.query(`
    SELECT shortlist.*
    FROM shortlist;
  `);

  return utils.formatResponse(
    [
      {
        villes: villes.rows,
        criteria: criteria.rows,
        values: values.rows,
      },
    ],
  );
};

export const updateShortlist = async ({ criterion_id, ville_id, value }: { criterion_id: number, ville_id: number, value: string }): Promise<any> => {
  debug("updateShortlist");
  await db.query(`
    INSERT INTO shortlist (criterion_id, ville_id, value) VALUES ($1, $2, $3)
      ON CONFLICT (criterion_id, ville_id) DO UPDATE SET value = $3;`,
    [criterion_id, ville_id, value],
  );
};
