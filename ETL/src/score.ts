import Debug from "debug";

import * as db from "./lib/db";

const debug = Debug("mbtf:ETL:score");

export const calculate = async () => {
  const components: string[] = [];

  const addComponent = (name: string) => {
    debug(`Calculating: ${name}`);
    components.push(name);
  };

  const simpleScore = async (name: string) => {
    addComponent(name);
    await db.query(`UPDATE villes SET ${name} = 100 WHERE ${name.replace("score_", "")} > 0;`);
  };

  debug("Calculating composite fields");
  await db.query(`
    UPDATE villes SET
      code_departement = SUBSTRING(code_postal, 1, 2)
    WHERE code_postal IS NOT NULL;
  `);
  await db.query(`
    UPDATE villes SET
      sante_medecin_pour_mille = ROUND(sante_medecin::decimal * 1000 / geo_population, 1),
      sante_dentiste_pour_mille = ROUND(sante_dentiste::decimal * 1000 / geo_population, 1),
      geo_densite = ROUND(geo_population / geo_superficie)
    WHERE geo_population > 0 AND geo_superficie > 0;
  `);
  await db.query(`
    UPDATE villes SET
      emploi_chomage = ROUND(emploi_actif_chomage::decimal * 100 / emploi_actif, 1)
    WHERE emploi_actif > 0;
  `);
  await db.query(`
    UPDATE villes SET 
      meteo_jours_de_pluie = stations_meteo.jours_de_pluie,
      meteo_temperature_hiver = stations_meteo.temperature_hiver,
      meteo_temperature_ete = stations_meteo.temperature_ete
    FROM stations_meteo 
    WHERE stations_meteo.code = villes.geo_station_meteo_code
  `);

  addComponent("score_geo_grande_ville_distance");
  await db.query("UPDATE villes SET score_geo_grande_ville_distance = CASE WHEN geo_grande_ville_distance <= 10 THEN 100 ELSE (100 - geo_grande_ville_distance) END;");
  await db.query("UPDATE villes SET score_geo_grande_ville_distance = 0 WHERE score_geo_grande_ville_distance < 0");
  await db.query("UPDATE villes SET score_geo_grande_ville_distance = 100 WHERE score_geo_grande_ville_distance > 100");

  // addComponent("score_geo_population");
  // await db.query("UPDATE villes SET score_geo_population = (100 - (100 * ABS($1 - geo_population) / $1));", [35000]);

  // addComponent("score_geo_densite");
  // await db.query("UPDATE villes SET score_geo_densite = ROUND(100 - (100 * ABS($1 - geo_densite) / ($1 * 1.5)));", [1500]);

  addComponent("score_geo_immobilier_prix_m2");
  await db.query("UPDATE villes SET score_geo_immobilier_prix_m2 = ROUND(100 - (100 * ABS($1 - geo_immobilier_prix_m2) / ($1 * 1.5)));", [2000]);

  await simpleScore("score_education_primaire");
  await simpleScore("score_education_college");
  await simpleScore("score_sante_dentiste");
  await simpleScore("score_sante_medecin");
  await simpleScore("score_sante_pharmacie");
  await simpleScore("score_service_banque");
  await simpleScore("score_service_poste");
  await simpleScore("score_commerce_boulangerie");
  await simpleScore("score_commerce_supermarche");

  addComponent("score_delinquance");
  await db.query("UPDATE villes SET score_delinquance = 100 - (100 * (villes.delinquance_aggression + villes.delinquance_cambriolage + villes.delinquance_stupefiant + villes.delinquance_vol + villes.delinquance_autre) / geo_population) WHERE geo_population > 0 ");

  addComponent("score_emploi_chomage");
  await db.query("UPDATE villes SET score_emploi_chomage = 100 + $1 - emploi_chomage;", [10]);


  addComponent("score_meteo_temperature_hiver");
  const { rows: [temperatures] } = await db.query("SELECT AVG(meteo_temperature_hiver) AS avg_hiver, AVG(meteo_temperature_ete) AS avg_ete FROM villes WHERE meteo_temperature_ete != 0;");
  await db.query("UPDATE villes SET score_meteo_temperature_hiver = (100 - (100 * ABS($1 - meteo_temperature_hiver) / $1));", [temperatures.avg_hiver]);

  addComponent("score_meteo_temperature_ete");
  await db.query("UPDATE villes SET score_meteo_temperature_ete = (100 - (100 * ABS($1 - meteo_temperature_ete) / $1));", [temperatures.avg_ete]);

  addComponent("score_meteo_jours_de_pluie");
  await db.query("UPDATE villes SET score_meteo_jours_de_pluie = 100 - (meteo_jours_de_pluie - $1) * 100 / $1;", [180]);

  for (const component of components) {
    debug(`Fixing: ${component}`);
    await db.query(`UPDATE villes SET ${component} = 0 WHERE ${component} < 0`);
    await db.query(`UPDATE villes SET ${component} = 100 WHERE ${component} > 100`);
  }

  debug("Calculating: score");
  await db.query("UPDATE villes SET score_geo_immobilier_prix_m2 = score_geo_immobilier_prix_m2 * 2;");
  // await db.query(`UPDATE villes SET score = (${components.join("+")}) / ${components.length + 1};`);
  await db.query(`UPDATE villes SET score = (${components.join("+")});`);
  await db.query("UPDATE villes SET score = 0 WHERE score IS NULL;");
  // await db.query("UPDATE villes SET score = -1 * score WHERE code_departement NOT IN ('01','03','14','15','16','17','18','19','23','24','27','28','33','35','36','37','38','40','41','42','43','44','45','46','47','49','50','53','56','58','61','63','64','69','71','72','73','74','85')");
  //await db.query("UPDATE villes SET score = -1 * score WHERE code_departement NOT IN ('14', '18','19','24','28','33','35','38','41','42','43','44','45','46','47','56','64','69','73','74')");

  debug("Calculating: classement");
  await db.query("UPDATE villes SET classement = NULL");
  await db.query(`
    UPDATE villes v
      SET classement = v2.classement
    FROM
    (
      SELECT code_insee, ROW_NUMBER() OVER(ORDER BY villes.score DESC, villes.score_geo_population ASC) AS classement
      FROM villes
      WHERE villes.code_postal IS NOT NULL
        AND villes.geo_immobilier_prix_m2 IS NOT NULL
        AND villes.geo_population > 0
        AND villes.geo_taxe_fonciere > 0
        AND villes.emploi_population > 0
        AND villes.score >= 0
    ) AS v2
    WHERE v2.code_insee = v.code_insee;`);
};

