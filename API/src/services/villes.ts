import Debug from "debug";

import * as db from "../lib/db";

const debug = Debug("mbtf:API:services/villes");

export interface ListOptions {
  limit?: number;
  page?: number;
  sort?: string;
  order?: "ASC" | "DESC";
  departement?: string;
}

export const listVilles = async (options?: ListOptions): Promise<any> => {
  if (!options) {
    options = {};
  }
  options.limit = options.limit || 15;
  options.page = options.page || 1;
  options.sort = options.sort || "score";
  options.order = options.order || "DESC";
  debug(`listVilles ${JSON.stringify(options)}`);
  const result = await db.query(`
    SELECT 
      villes.*,
      grande_ville.nom AS geo_grande_ville_nom,
      ROW_NUMBER() OVER(ORDER BY villes.score DESC, villes.score_geo_population ASC) AS classement
    FROM villes
      INNER JOIN villes AS grande_ville ON grande_ville.code_insee = villes.geo_grande_ville_code_insee
      INNER JOIN stations_meteo ON stations_meteo.code = villes.geo_station_meteo_code
    WHERE villes.code_postal IS NOT NULL
      AND villes.geo_immobilier_prix_m2 IS NOT NULL
      AND villes.geo_population > 0
      AND villes.emploi_population > 0
      AND villes.score >= 0
      ${options.departement ? `AND villes.code_departement = '${options.departement}'` : ""}
    ORDER BY villes.${options.sort} ${options.order}, villes.score DESC, villes.score_geo_population ASC
    LIMIT $1 
    OFFSET $2`,
    [options.limit, (options.page - 1) * options.limit],
  );
  const totalRows = await db.query("SELECT COUNT(*) AS total FROM villes WHERE villes.code_postal IS NOT NULL AND villes.geo_population IS NOT NULL AND villes.score > 0");

  return {
    meta: {
      page: options.page,
      rows: result.rows.length,
      pages: Math.ceil(+totalRows.rows[0].total / options.limit),
      total: +totalRows.rows[0].total,
    },
    items: result.rows,
  };
};
