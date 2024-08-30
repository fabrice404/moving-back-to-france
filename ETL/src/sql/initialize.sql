DROP TABLE IF EXISTS villes;

CREATE TABLE villes (
  code_insee VARCHAR(5) PRIMARY KEY,
  code_postal VARCHAR(5),
  code_departement VARCHAR(2),
  nom TEXT,
  
  /* Geograhie */
  geo_altitude INT,
  geo_latitude DECIMAL,
  geo_longitude DECIMAL,
  geo_population INT,
  geo_superficie DECIMAL,
  geo_densite INT,
  geo_immobilier_prix_m2 INT,
  geo_grande_ville_code_insee VARCHAR(5),
  geo_grande_ville_distance INT,
  geo_station_meteo_code VARCHAR(64),
  geo_taxe_fonciere DECIMAL,
  geo_shape TEXT,
  /* Commerce */
  commerce_bricolage INT DEFAULT(0),
  commerce_boucherie INT DEFAULT(0),
  commerce_primeur INT DEFAULT(0),
  commerce_chaussures INT DEFAULT(0),
  commerce_boulangerie INT DEFAULT(0),
  commerce_coiffeur INT DEFAULT(0),
  commerce_meubles INT DEFAULT(0),
  commerce_sports_loisirs INT DEFAULT(0),
  commerce_supermarche INT DEFAULT(0),
  commerce_vetements INT DEFAULT(0),
  /* Education */
  education_maternelle INT DEFAULT(0),
  education_primaire INT DEFAULT(0),
  education_college INT DEFAULT(0),
  education_lycee INT DEFAULT(0),
  /* Loisirs */
  loisir_bibliotheque INT DEFAULT(0),
  loisir_cinema INT DEFAULT(0),
  /* Sante */
  sante_dentiste INT DEFAULT(0),
  sante_gynecologue INT DEFAULT(0),
  sante_medecin INT DEFAULT(0),
  sante_opticien INT DEFAULT(0),
  sante_opthalmologue INT DEFAULT(0),
  sante_pharmacie INT DEFAULT(0),
  sante_urgences INT DEFAULT(0),
  sante_medecin_pour_mille DECIMAL DEFAULT(0),
  sante_dentiste_pour_mille DECIMAL DEFAULT(0),
  /* Services */
  service_banque INT DEFAULT(0),
  service_decheterie INT DEFAULT(0),
  service_poste INT DEFAULT(0),
  /* Sport */
  sport_equitation INT DEFAULT(0),
  sport_piscine INT DEFAULT(0),
  /* Transport */
  transport_aeroport INT DEFAULT(0),
  transport_gare INT DEFAULT(0),
  /* Delinquance */
  delinquance_aggression INT DEFAULT(0),
  delinquance_cambriolage INT DEFAULT(0),
  delinquance_stupefiant INT DEFAULT(0),
  delinquance_vol INT DEFAULT(0),
  delinquance_autre INT DEFAULT(0),
  /* Emploi */
  emploi_population INT DEFAULT(0),
  emploi_actif INT DEFAULT(0),
  emploi_actif_occupe INT DEFAULT(0),
  emploi_actif_chomage INT DEFAULT(0),
  emploi_chomage DECIMAL DEFAULT(0),
  /* Meteo */
  meteo_temperature_hiver DECIMAL DEFAULT(0),
  meteo_temperature_ete DECIMAL DEFAULT(0),
  meteo_jours_de_pluie INT DEFAULT(0),
  /* Score */
  score INT DEFAULT(0),
  score_geo_population INT DEFAULT(0),
  score_geo_densite INT DEFAULT(0),
  score_geo_immobilier_prix_m2 INT DEFAULT(0),
  score_education_primaire INT DEFAULT(0),
  score_education_college INT DEFAULT(0),
  score_sante_dentiste INT DEFAULT(0),
  score_sante_medecin INT DEFAULT(0),
  score_sante_pharmacie INT DEFAULT(0),
  score_service_banque INT DEFAULT(0),
  score_service_poste INT DEFAULT(0),
  score_commerce_boulangerie INT DEFAULT(0),
  score_commerce_supermarche INT DEFAULT(0),
  score_geo_grande_ville_distance INT DEFAULT(0),
  score_delinquance INT DEFAULT(0),
  score_emploi_chomage INT DEFAULT(0),
  score_meteo_temperature_hiver INT DEFAULT(0),
  score_meteo_temperature_ete INT DEFAULT(0),
  score_meteo_jours_de_pluie INT DEFAULT(0),
  classement INT,
);

DROP TABLE IF EXISTS ventes_immobilieres;

CREATE TABLE ventes_immobilieres (
  id_vente VARCHAR(64) PRIMARY KEY,
  code_insee VARCHAR(5),
  prix INT,
  surface INT,
  pieces INT
);

DROP TABLE IF EXISTS voisins;

CREATE TABLE voisins (
  code_insee_1 VARCHAR(5),
  code_insee_2 VARCHAR(5),
  distance INT,
  PRIMARY KEY (code_insee_1, code_insee_2)
);

DROP TABLE IF EXISTS stations_meteo;

CREATE TABLE stations_meteo (
  code VARCHAR(64) PRIMARY KEY,
  nom TEXT,
  geo_latitude DECIMAL,
  geo_longitude DECIMAL,
  geo_altitude INT,
  precipitations INT DEFAULT(0),
  temperature_moyenne DECIMAL DEFAULT(0),
  temperature_hiver DECIMAL DEFAULT(0),
  temperature_ete DECIMAL DEFAULT(0),
  ensoleillement INT DEFAULT(0),
  enneigement INT DEFAULT(0),
  jours_de_pluie INT DEFAULT(0),
  mesures INT DEFAULT(0)
);

CREATE TABLE stations_meteo_mois (
  code VARCHAR(64),
  mois VARCHAR(2),
  precipitations INT DEFAULT(0),
  temperature_moyenne DECIMAL DEFAULT(0),
  ensoleillement INT DEFAULT(0),
  enneigement INT DEFAULT(0),
  jours_de_pluie INT DEFAULT(0),
  mesures INT DEFAULT(0),
  PRIMARY KEY (code, mois)
);
