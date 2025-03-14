import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface Voisin {
  code_insee: string;
  nom: string;
  geo_shape: string;
  score: number;
  classement: number;
}

export interface StationMeteoMois {
  code: string;
  mois: string;
  precipitations: number;
  temperature_moyenne: number;
  ensoleillement: number;
  enneigement: number;
  jours_de_pluie: number;
  mesures: number;
}
export interface StationMeteo {
  code: string;
  nom: string;
  geo_latitude: number;
  geo_longitude: number;
  geo_altitude: number;
  precipitations: number;
  temperature_moyenne: number;
  temperature_hiver: number;
  temperature_ete: number;
  ensoleillement: number;
  enneigement: number;
  jours_de_pluie: number;
  mesures: number;
  mois: StationMeteoMois[];
}

export interface VenteImmobiliere {
  id_vente: string;
  code_insee: string;
  date: string;
  prix: number;
  surface: number;
  pieces: number;
}

export interface Ville {
  code_insee: string;
  code_postal: string;
  code_departement: string;
  nom: string;
  /* Geograhie */
  geo_altitude: number;
  geo_latitude: number;
  geo_longitude: number;
  geo_population: number;
  geo_superficie: number;
  geo_immobilier_prix_m2: number;
  geo_grande_ville_code_insee: string;
  geo_grande_ville_distance: number;
  geo_densite: number;
  geo_taxe_fonciere: number;
  geo_shape: string;
  /* Commerce */
  commerce_bricolage: number;
  commerce_boulangerie: number;
  commerce_coiffeur: number;
  commerce_meubles: number;
  commerce_sports_loisirs: number;
  commerce_supermarche: number;
  commerce_vetements: number;
  commerce_boucherie: number;
  commerce_primeur: number;
  commerce_chaussures: number;
  /* Education */
  education_maternelle: number;
  education_primaire: number;
  education_college: number;
  education_lycee: number;
  /* Loisirs */
  loisir_bibliotheque: number;
  loisir_cinema: number;
  /* Sante */
  sante_dentiste: number;
  sante_gynecologue: number;
  sante_medecin: number;
  sante_opticien: number;
  sante_opthalmologue: number;
  sante_pharmacie: number;
  sante_urgences: number;
  sante_medecin_pour_mille: number;
  sante_dentiste_pour_mille: number;
  /* Services */
  service_banque: number;
  service_decheterie: number;
  service_poste: number;
  /* Sport */
  sport_equitation: number;
  sport_piscine: number;
  /* Transport */
  transport_aeroport: number;
  transport_gare: number;
  /* Delinquance */
  delinquance_aggression: number;
  delinquance_cambriolage: number;
  delinquance_stupefiant: number;
  delinquance_vol: number;
  delinquance_autre: number;
  /* Emploi */
  emploi_population: number;
  emploi_actif: number;
  emploi_actif_occupe: number;
  emploi_actif_chomage: number;
  emploi_chomage: number;
  /* Meteo */
  meteo_temperature_hiver: number;
  meteo_temperature_ete: number;
  meteo_jours_de_pluie: number;
  /* Score */
  score: number;
  score_geo_population: number;
  score_geo_densite: number;
  score_geo_immobilier_prix_m2: number;
  score_education_primaire: number;
  score_education_college: number;
  score_sante_dentiste: number;
  score_sante_medecin: number;
  score_sante_pharmacie: number;
  score_service_banque: number;
  score_service_poste: number;
  score_commerce_boulangerie: number;
  score_commerce_supermarche: number;
  score_geo_grande_ville_distance: number;
  score_delinquance: number;
  score_emploi_chomage: number;
  score_meteo_temperature_hiver: number;
  score_meteo_temperature_ete: number;
  score_meteo_jours_de_pluie: number;
  classement: number;

  /* Calculated */
  geo_grande_ville_nom: string;
  voisins: Voisin[];
  station_meteo: StationMeteo;
  ventes_immobilieres: VenteImmobiliere[];
}

export interface VillesParams {
  page: number;
  limit: number;
  sort: string;
  order: "ASC" | "DESC";
  scores: boolean;
  departement?: string;
  codeInsee?: string;
}
