import { Client } from "pg";

import Debug from "debug";
import path from "path";

import * as io from "./io";

const debug = Debug("mbtf:ETL:lib/db");

let client: Client;

export const connect = async () => {
  debug("connect");
  client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });
  await client.connect();
};

export const disconnect = async () => {
  debug("disconnect");
  await client.end();
};

export const initialize = async () => {
  debug("initialize");
  const initScript = io.readFile(path.join(__dirname, "../sql/initialize.sql"));
  await client.query(initScript);
};

export const query = async (query: string, params: any[] = []) => {
  try {
    return await client.query(query, params);
  } catch (ex) {
    console.log({ ex, query, params });
    throw ex;
  }
};
