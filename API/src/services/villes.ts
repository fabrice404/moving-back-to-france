import Debug from "debug";

import * as db from "../lib/db";
import * as utils from "../lib/utils";

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
      grande_ville.nom AS geo_grande_ville_nom
    FROM villes
      INNER JOIN villes AS grande_ville ON grande_ville.code_insee = villes.geo_grande_ville_code_insee
      INNER JOIN stations_meteo ON stations_meteo.code = villes.geo_station_meteo_code
    WHERE villes.classement IS NOT NULL
      ${options.departement ? `AND villes.code_departement = '${options.departement}'` : ""}
    ORDER BY villes.${options.sort} ${options.order}, villes.score DESC, villes.score_geo_population ASC
    LIMIT $1 
    OFFSET $2`,
    [options.limit, (options.page - 1) * options.limit],
  );
  const totalRows = await db.query("SELECT COUNT(*) AS total FROM villes WHERE villes.code_postal IS NOT NULL AND villes.geo_population IS NOT NULL AND villes.score > 0");

  return utils.formatResponse(
    result.rows,
    options.page,
    Math.ceil(+totalRows.rows[0].total / options.limit),
    +totalRows.rows[0].total,
  );
};

export interface GetOptions {
  code_insee?: string;
}

export const getVille = async (options?: GetOptions): Promise<any> => {
  if (!options?.code_insee) {
    return;
  }
  const result = await db.query(`
    SELECT villes.*
    FROM villes
    WHERE villes.code_insee = $1`,
    [options.code_insee],
  );

  const ville = result.rows[0];

  const voisins = await db.query(`
    SELECT villes.code_insee, villes.nom, villes.score, villes.geo_shape, villes.classement
    FROM voisins 
      INNER JOIN villes ON villes.code_insee = CASE WHEN voisins.code_insee_1 = $1 THEN voisins.code_insee_2 ELSE voisins.code_insee_1 END 	
    WHERE $1 IN (voisins.code_insee_1, voisins.code_insee_2);`,
    [ville.code_insee],
  );
  ville.voisins = voisins.rows;

  const stationMeteo = await db.query("SELECT * FROM stations_meteo WHERE code = $1;", [ville.geo_station_meteo_code]);
  ville.station_meteo = stationMeteo.rows[0];

  const mois = await db.query("SELECT * FROM stations_meteo_mois WHERE code = $1;", [ville.geo_station_meteo_code]);
  ville.station_meteo.mois = mois.rows;

  return utils.formatResponse([ville]);
};
