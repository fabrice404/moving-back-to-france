"use client";

import { Chip, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import dynamic from 'next/dynamic';
import { useEffect, useState, useMemo } from "react"
import { ApexOptions } from "apexcharts";

import * as types from "@/types";
import { getScoreColorText } from "@/helpers";


export default function Ville({ params }: any) {

  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (data == null) {
      fetch(`${process.env.NEXT_PUBLIC_API_HOST}/ville?code_insee=${params.slug[0]}`)
        .then(response => response.json())
        .then(data => setData(data));
    }
  }, [data]);

  const Map = useMemo(() => dynamic(() => import("@/components/map"), { ssr: false }), []);
  const Chart = useMemo(() => dynamic(() => import('react-apexcharts'), { ssr: false }), []);

  if (!data) {
    return (
      <section className="flex flex-col items-center justify-center gap-4">
        <Spinner label="Loading..." />
      </section>
    );
  }

  const ville = data.items[0] as types.Ville;

  const temperaturesSeries = [{
    name: "Temperature moyenne",
    type: "line",
    data: ville.station_meteo.mois.sort((a, b) => parseFloat(a.mois) > parseFloat(b.mois) ? 1 : -1).map(m => parseFloat(`${m.temperature_moyenne}`)),
  }, {
    name: "Jours de pluie",
    type: "column",
    data: ville.station_meteo.mois.sort((a, b) => parseFloat(a.mois) > parseFloat(b.mois) ? 1 : -1).map(m => parseFloat(`${m.jours_de_pluie}`)),
  }];
  const temperaturesOptions: ApexOptions = {
    chart: {
      type: 'line',
      zoom: { enabled: false },
      toolbar: { show: false },
    },
    colors: ['#E39600', '#008FFB'],
    dataLabels: { enabled: true },
    stroke: { width: 2 },
    xaxis: { categories: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'], },
    yaxis: [{ min: Math.floor(Math.min(0, ...ville.station_meteo.mois.map(m => parseFloat(`${m.temperature_moyenne}`)))) }, { opposite: true, min: 0 }],
  };

  const tableRow = (icon: string, label: string, value: number | string) => (
    <tr>
      <td><img alt={icon} className="w-6 h-6 min-w-6 min-h-6" src={`/images/${icon}`} /></td>
      <td className="pl-1 pr-5">{label}</td>
      <td className="text-right">{value}</td>
    </tr>
  )

  const styleBlock = "shadow shadow-neutral-200 dark:shadow-neutral-700 p-4 rounded-xl mb-4 overflow-hidden";
  const styleCategory = "text-xl font-bold mb-4";
  const styleTable = "w-full";

  return (
    <section className="w-full">
      <div className="text-center pb-4">
        <h1 className="text-3xl font-bold">{ville.nom}</h1>
        <Chip className="border-none mx-1" color="primary" radius="sm" size="sm">{ville.code_postal}</Chip>
        <Chip className="border-none mx-1" color={getScoreColorText(ville.score)} radius="sm" size="sm">{ville.score}%</Chip>
      </div>
      <div className="flex">
        <div className="w-1/3 flex gap-4 p-2">
          <div className="w-1/2">
            <div className={styleBlock}>
              <h2 className={styleCategory}>Santé</h2>
              <table className={styleTable}>
                <tbody>
                  {tableRow("medecin.png", "Médecin", ville.sante_medecin)}
                  {tableRow("dentiste.png", "Dentiste", ville.sante_dentiste)}
                  {tableRow("ophtalmologue.png", "Ophtalmologue", ville.sante_opthalmologue)}
                  {tableRow("gynecologue.png", "Gynécologue", ville.sante_gynecologue)}
                  {tableRow("pharmacie.png", "Pharmacie", ville.sante_pharmacie)}
                  {tableRow("opticien.png", "Opticien", ville.sante_opticien)}
                  {tableRow("urgences.png", "Urgences", ville.sante_urgences)}
                </tbody>
              </table>
            </div>
            <div className={styleBlock}>
              <h2 className={styleCategory}>Ecoles</h2>
              <table className={styleTable}>
                <tbody>
                  {tableRow("maternelle.png", "Maternelle", ville.education_maternelle)}
                  {tableRow("primaire.png", "Primaire", ville.education_primaire)}
                  {tableRow("college.png", "Collége", ville.education_college)}
                  {tableRow("lycee.png", "Lycée", ville.education_lycee)}
                </tbody>
              </table>
            </div>
            <div className={styleBlock}>
              <h2 className={styleCategory}>Loisirs</h2>
              <table className={styleTable}>
                <tbody>
                  {tableRow("bibliotheque.png", "Bibliothèque", ville.loisir_bibliotheque)}
                  {tableRow("cinema.png", "Cinéma", ville.loisir_cinema)}
                  {tableRow("equitation.png", "Centre équestre", ville.sport_equitation)}
                  {tableRow("piscine.png", "Piscine", ville.sport_piscine)}
                </tbody>
              </table>
            </div>
          </div>
          <div className="w-1/2">
            <div className={styleBlock}>
              <h2 className={styleCategory}>Services</h2>
              <table className={styleTable}>
                <tbody>
                  {tableRow("banque.png", "Banque", ville.service_banque)}
                  {tableRow("decheterie.png", "Décheterie", ville.service_decheterie)}
                  {tableRow("poste.png", "Poste", ville.service_poste)}
                </tbody>
              </table>
            </div>
            <div className={styleBlock}>
              <h2 className={styleCategory}>Commerces</h2>
              <table className={styleTable}>
                <tbody>
                  {tableRow("supermarche.png", "Supermarché", ville.commerce_supermarche)}
                  {tableRow("boulangerie.png", "Boulangerie", ville.commerce_boulangerie)}
                  {tableRow("boucherie.png", "Boucherie", ville.commerce_boucherie)}
                  {tableRow("primeur.png", "Primeur", ville.commerce_primeur)}
                  {tableRow("coiffeur.png", "Coiffeur", ville.commerce_coiffeur)}
                  {tableRow("meubles.png", "Meubles", ville.commerce_meubles)}
                  {tableRow("sports_loisirs.png", "Sports/loisirs", ville.commerce_sports_loisirs)}
                  {tableRow("vetements.png", "Vêtements", ville.commerce_vetements)}
                  {tableRow("chaussures.png", "Chaussures", ville.commerce_chaussures)}
                  {tableRow("bricolage.png", "Bricolage", ville.commerce_bricolage)}
                </tbody>
              </table>
            </div>
            <div className={styleBlock}>
              <h2 className={styleCategory}>Transport</h2>
              <table className={styleTable}>
                <tbody>
                  {tableRow("aeroport.png", "Aéroport", ville.transport_aeroport)}
                  {tableRow("gare.png", "Gare", ville.transport_gare)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="w-2/3 flex p-2">
          {Intl.NumberFormat('fr-FR').format(ville.geo_population)}
          /
          {Intl.NumberFormat('fr-FR').format(ville.geo_immobilier_prix_m2)}
          /
          {Intl.NumberFormat('fr-FR').format(ville.geo_taxe_fonciere)}

          {Intl.NumberFormat('fr-FR').format(ville.delinquance_aggression)}
          {Intl.NumberFormat('fr-FR').format(ville.delinquance_cambriolage)}
          {Intl.NumberFormat('fr-FR').format(ville.delinquance_stupefiant)}
          {Intl.NumberFormat('fr-FR').format(ville.delinquance_vol)}
          {Intl.NumberFormat('fr-FR').format(ville.delinquance_autre)}
        </div>
      </div>
      <div className="flex gap-4">
        <div className="w-1/2">
          <div className={`${styleBlock} w-full h-1/3`}>
            <Map ville={ville} />
          </div>
          <div className={styleBlock}>
            <h2 className={styleCategory}>Météo: {ville.station_meteo.nom}</h2>
            <Chart height={300} options={temperaturesOptions} series={temperaturesSeries} type="line" />
          </div>
        </div>
        <div className="w-1/2">
          <div className={styleBlock}>
            <h2 className={styleCategory}>Ventes immobilières</h2>
            <Table isStriped aria-label="Ventes immobilières">
              <TableHeader>
                <TableColumn>Date</TableColumn>
                <TableColumn align="end">Prix</TableColumn>
                <TableColumn align="end">Surface</TableColumn>
                <TableColumn align="end">Pièces</TableColumn>
                <TableColumn align="end">Prix m²</TableColumn>
              </TableHeader>
              <TableBody items={ville.ventes_immobilieres.filter((v) => v.surface >= 100 && v.date.startsWith("2023"))}>
                {(vente: types.VenteImmobiliere) => (
                  <TableRow key={vente.id_vente}>
                    <TableCell>{vente.date}</TableCell>
                    <TableCell>{Intl.NumberFormat('fr-FR').format(vente.prix)} €</TableCell>
                    <TableCell>{Intl.NumberFormat('fr-FR').format(vente.surface)} m²</TableCell>
                    <TableCell>{Intl.NumberFormat('fr-FR').format(vente.pieces)}</TableCell>
                    <TableCell>{Intl.NumberFormat('fr-FR').format(Math.round(vente.prix / vente.surface))} €/m²</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  )
}
