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

  await score.calculate();

  await db.disconnect();
};

main();
