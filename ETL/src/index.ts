import "dotenv/config";

import Debug from "debug";

import * as score from "./score";

import * as db from "./lib/db";

import * as bpe from "./sources/bpe";
import * as codePostalGPS from "./sources/code-postal-gps";
import * as delinquance from "./sources/delinquance";
import * as dvf from "./sources/dvf";
import * as emploi from "./sources/emploi";
import * as meteo from "./sources/meteo";
import * as population from "./sources/population";
import * as taxeFonciere from "./sources/taxe-fonciere";


import * as city from "./city";

const debug = Debug("mbtf:ETL:index");

const main = async () => {
  debug("main");
  await db.connect();

  // await db.initialize();

  // await bpe.importData();
  // await codePostalGPS.importData();
  // await delinquance.importData();
  // await dvf.importData();
  // await emploi.importData();
  // await meteo.importData();
  // await population.importData();
  // await taxeFonciere.importData();

  // await score.calculate();

  await city.main("caen", 48.9, 49.6, -0.65, 0, 49.2, -0.35);
  await city.main("le-havre", 49.3, 50, -0.10, 0.65, 49.55, 0.25);

  await db.disconnect();
};

main();
