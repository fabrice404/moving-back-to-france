"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Spinner,
  Chip,
  SortDescriptor,
  Pagination,
  Switch,
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";

import { Ville, VillesParams } from "@/types";
import { VerticalDotsIcon } from "@/components/icons";
import { getScoreColorText } from "@/helpers";


const fetcher = (arg: any) => fetch(arg).then((res) => res.json());

export default function Liste() {
  const [params, setParams] = useState<VillesParams>({ page: 1, limit: 15, sort: "score", order: "DESC", scores: false, departement: "", codeInsee: "" });

  let { data, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_API_HOST}/villes?page=${params.page}&limit=${params.limit}&sort=${params.sort}&order=${params.order}&scores=${params.scores}&departement=${params.departement}&codeInsee=${params.codeInsee}`,
    fetcher,
    { keepPreviousData: true },
  );

  const sortDescriptor: SortDescriptor = {
    column: params.sort,
    direction: params.order === "ASC" ? "ascending" : "descending"
  };
  const sort = (args: any) => {
    setParams({
      ...params,
      sort: args.column,
      order: args.direction === "ascending" ? "ASC" : "DESC"
    });
  };

  if (!data) {
    return (
      <section className="flex flex-col items-center justify-center gap-4">
        <Spinner label="Loading..." />
      </section>
    );
  }

  const scoreClass = params.scores ? "text-2xs" : "hidden"

  const getColumnHeader = (key: string, name: string) => {
    if (name.match(/\.png$/)) {
      return (
        <TableColumn key={key} allowsSorting align="center">
          <img alt={name} className="w-6 h-6 min-w-6 min-h-6 inline ml-5" src={`/images/${name}`} />
        </TableColumn>
      )
    }

    return (
      <TableColumn key={key} allowsSorting align="center">{name}</TableColumn>
    )
  };

  const getColumnCell = (ville: any, key: string, score: string, unit: string = "") => (
    <TableCell key={key}>
      <Chip className="border-none" color={getScoreColorText(ville[score])} radius="sm" size="sm">
        {Intl.NumberFormat('fr-FR').format(ville[key])}{unit}
      </Chip>
      <div className={scoreClass}>{ville[score]}%</div>
    </TableCell>
  );

  return (
    <section className="flex flex-col items-center justify-center gap-4">
      <div className="w-full flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">{data.meta.total} villes</span>
          <Switch defaultSelected={params.scores} size="sm" onValueChange={(b) => setParams({ ...params, scores: b })}>
            Afficher le detail des scores
          </Switch>
          <Switch defaultSelected={params.codeInsee !== ""} size="sm" onValueChange={(b) => setParams({ ...params, codeInsee: b ? "74010,64445,47001,24322,24037,45234,35238,18033,31555,82121,19031,69123" : "" })}>
            Shortlist
          </Switch>
          <label className="flex items-center text-default-400 text-small">
            Villes par page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              defaultValue={params.limit}
              onChange={(e) => setParams({ ...params, limit: parseInt(e.target.value), page: 1 })}
            >
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
            </select>
          </label>
        </div>
      </div>
      <Table
        isStriped
        aria-label="Liste des villes de France"
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={params.page}
              total={data.meta.pages}
              onChange={(page) => setParams({ ...params, page })}
            />
          </div>
        }
        color="primary"
        selectionMode="single"
        sortDescriptor={sortDescriptor}
        onSortChange={sort}
      >
        <TableHeader>
          <TableColumn>#</TableColumn>
          <TableColumn>Ville</TableColumn>
          <TableColumn align="center">&nbsp;</TableColumn>
          <TableColumn key="geo_population" allowsSorting align="center">Population</TableColumn>
          {getColumnHeader("geo_densite", "Densité")}
          {getColumnHeader("geo_immobilier_prix_m2", "Prix m²")}
          {getColumnHeader("geo_taxe_fonciere", "Taxe foncière")}
          {getColumnHeader("education_primaire", "primaire.png")}
          {getColumnHeader("education_college", "college.png")}
          {getColumnHeader("sante_medecin_pour_mille", "medecin.png")}
          {getColumnHeader("sante_dentiste_pour_mille", "dentiste.png")}
          {getColumnHeader("sante_pharmacie", "pharmacie.png")}
          {getColumnHeader("service_poste", "poste.png")}
          {getColumnHeader("service_banque", "banque.png")}
          {getColumnHeader("commerce_supermarche", "supermarche.png")}
          {getColumnHeader("commerce_boulangerie", "boulangerie.png")}
          {getColumnHeader("meteo_temperature_hiver", "temp-hiver.png")}
          {getColumnHeader("meteo_temperature_ete", "temp-ete.png")}
          {getColumnHeader("meteo_jours_de_pluie", "pluie.png")}
          {getColumnHeader("emploi_chomage", "chomage.png")}
          <TableColumn key="score_delinquance" allowsSorting align="center">
            <img alt="Délinquance" className="w-6 h-6 min-w-6 min-h-6 inline ml-5" src={`/images/delinquance.png`} />
          </TableColumn>

          <TableColumn key="score_delinquance" allowsSorting align="center">
            <img alt="Grande ville" className="w-6 h-6 min-w-6 min-h-6 inline ml-5" src={`/images/grande-ville.png`} />
          </TableColumn>

          <TableColumn key="score" allowsSorting align="center">Score</TableColumn>
          <TableColumn align="center">&nbsp;</TableColumn>
        </TableHeader>
        <TableBody
          isLoading={isLoading}
          items={data?.items ?? []}
          loadingContent={<Spinner label="Loading..." />}
        >
          {(ville: Ville) => (
            <TableRow key={ville.code_insee}>
              <TableCell>{ville.classement}</TableCell>
              <TableCell><Link className="whitespace-nowrap" href={`/ville/${ville.code_insee}/${ville.nom}/`}>{ville.nom}</Link></TableCell>
              <TableCell><Link href="#" onClick={() => setParams({ ...params, departement: ville.code_departement })}>{ville.code_departement}</Link></TableCell>
              <TableCell>
                <Chip className="border-none" color="default" radius="sm" size="sm">
                  {Intl.NumberFormat('fr-FR').format(ville.geo_population)}
                </Chip>
              </TableCell>
              {getColumnCell(ville, "geo_densite", "score_geo_densite")}
              {getColumnCell(ville, "geo_immobilier_prix_m2", "score_geo_immobilier_prix_m2")}
              <TableCell>
                <Chip className="border-none" color="default" radius="sm" size="sm">
                  {Intl.NumberFormat('fr-FR').format(ville.geo_taxe_fonciere)}
                </Chip>
              </TableCell>
              {getColumnCell(ville, "education_primaire", "score_education_primaire")}
              {getColumnCell(ville, "education_college", "score_education_college")}
              {getColumnCell(ville, "sante_medecin_pour_mille", "score_sante_medecin")}
              {getColumnCell(ville, "sante_dentiste_pour_mille", "score_sante_dentiste")}
              {getColumnCell(ville, "sante_pharmacie", "score_sante_pharmacie")}
              {getColumnCell(ville, "service_poste", "score_service_poste")}
              {getColumnCell(ville, "service_banque", "score_service_banque")}
              {getColumnCell(ville, "commerce_supermarche", "score_commerce_supermarche")}
              {getColumnCell(ville, "commerce_boulangerie", "score_commerce_boulangerie")}
              {getColumnCell(ville, "meteo_temperature_hiver", "score_meteo_temperature_hiver", "°C")}
              {getColumnCell(ville, "meteo_temperature_ete", "score_meteo_temperature_ete", "°C")}
              {getColumnCell(ville, "meteo_jours_de_pluie", "score_meteo_jours_de_pluie", "j")}
              {getColumnCell(ville, "emploi_chomage", "score_emploi_chomage", "%")}
              <TableCell>
                <Chip className="border-none" color={getScoreColorText(ville.score_delinquance)} radius="sm" size="sm">
                  {Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format((ville.delinquance_aggression +
                    ville.delinquance_cambriolage +
                    ville.delinquance_stupefiant +
                    ville.delinquance_vol +
                    ville.delinquance_autre) * 100 / ville.geo_population)}%
                </Chip>
                <div className={scoreClass}>{ville.score_delinquance}%</div>
              </TableCell>

              <TableCell>
                <Chip className="border-none" color={getScoreColorText(ville.score_geo_grande_ville_distance)} radius="sm" size="sm">
                  {ville.code_insee === ville.geo_grande_ville_code_insee ? "📍" : `${ville.geo_grande_ville_nom} ${ville.geo_grande_ville_distance}km`}
                </Chip>
                <div className={scoreClass}>{ville.score_geo_grande_ville_distance}%</div>
              </TableCell>

              <TableCell>
                <Chip className="border-none" color={getScoreColorText(ville.score)} radius="sm" size="sm">
                  {Intl.NumberFormat('fr-FR').format(ville.score)}
                </Chip>
              </TableCell>

              <TableCell>
                <div className="relative flex justify-end items-center gap-2">
                  <Dropdown className="bg-background border-1 border-default-200">
                    <DropdownTrigger>
                      <Button isIconOnly radius="full" size="sm" variant="light">
                        <VerticalDotsIcon className="text-default-400" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu>
                      <DropdownItem
                        href={`https://www.google.fr/maps/place/${ville.code_postal}+${encodeURIComponent(ville.nom)},+France/`}
                        target="maps"
                      >Maps</DropdownItem>
                      <DropdownItem
                        href={`https://www.google.fr/search?q=${encodeURIComponent(ville.nom)}`}
                        target="google"
                      >Google</DropdownItem>
                      <DropdownItem
                        href={`https://www.seloger.com/list.htm?projects=2&types=2&natures=1,2,4&places=[{%22inseeCodes%22:[${ville.code_insee.substring(0, 2)}0${ville.code_insee.substring(2, 5)}]}]&price=150000/350000&surface=100/1000&bedrooms=3,4,5&sort=a_px&mandatorycommodities=1&enterprise=0&epc=A,B,C&qsVersion=1.0&m=search_refine-redirection-search_results`}
                        target="seloger"
                      >SeLoger.com</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </section >
  );
}
