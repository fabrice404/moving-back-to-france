import Debug from "debug";
import path from "path";

import * as io from "./lib/io";
import { nearbySearch } from "./sources/google";

const debug = Debug("mbtf:ETL:city");

// safely add two floating point numbers
const add = (a: number, b: number) => {
  return parseFloat((a + b).toFixed(10));
};

export const main = async (
  name: string,
  latMin: number,
  latMax: number,
  longMin: number,
  longMax: number,
  latMap: number,
  longMap: number,
) => {
  // https://data.education.gouv.fr/explore/dataset/fr-en-adresse-et-geolocalisation-etablissements-premier-et-second-degre/
  const schools = JSON.parse(io.readFile(
    path.join(__dirname, "../../data/data-gouv/ecoles.json"),
  ));

  // google places API
  const supermarkets: { [key: string]: any } = {};
  const bakeries: { [key: string]: any } = {};
  for (let lat = latMin; lat <= latMax; lat = add(lat, 0.1)) {
    for (let long = longMin; long <= longMax; long = add(long, 0.1)) {
      let places = await nearbySearch(["supermarket"], lat, long);
      for (const place of places) {
        supermarkets[place.id] = place;
      }
      places = await nearbySearch(["bakery"], lat, long);
      for (const place of places) {
        bakeries[place.id] = place;
      }
    }
  }


  const data = {
    center: {
      lat: latMap,
      long: longMap,
    },
    schools:
      schools.filter((s: any) => s.latitude >= latMin &&
        s.latitude <= latMax &&
        s.longitude >= longMin &&
        s.longitude <= longMax,
      ),
    supermarkets: Object.values(supermarkets),
    bakeries: Object.values(bakeries),
  };

  io.saveFile(
    path.join(__dirname, `../../data/villes/${name}.json`),
    JSON.stringify(data, null, 2),
  );
};
