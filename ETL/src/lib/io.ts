import Debug from "debug";
import { createReadStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "fs";
import readline from "readline";

const debug = Debug("mbtf:ETL:lib/io");

export const saveFile = (path: string, content: string): void => {
  debug(`saveFile: ${path}`);
  const folder = path.split("/").slice(0, -1).join("/");
  mkdirSync(folder, { recursive: true });
  writeFileSync(path, content);
};

export const hasFile = (path: string, ttl: number = 60 * 24) => {
  debug(`hasFile: ${path}`);
  if (existsSync(path)) {
    if (ttl === -1) { // no expiration
      return true;
    }
    const expired = new Date(new Date().getTime() - (ttl * 60 * 1000));
    return statSync(path).mtime > expired;
  }
  return false;
};

export const readFile = (path: string) => {
  debug(`readFile: ${path}`);
  return readFileSync(path, "utf-8");
};

export const csvLineToArray = (line: string, delimiter: string = ",", quote: string = "\""): string[] => {
  const result: string[] = [];

  let current = "";
  let opened = false;

  for (const c of line) {
    switch (c) {
      case quote:
        opened = !opened;
        break;
      case delimiter:
        if (opened) {
          current += c;
          break;
        }
        result.push(current);
        current = "";
        break;
      default:
        current += c;
    }
  }
  if (current.length) {
    result.push(current);
  }

  return result;

};

export interface ReadCSVOptions {
  delimiter?: string;
  quote?: string;
  columnsToKeep?: string[];
  matchPattern?: RegExp;
}
export const readCSV = async (path: string, { delimiter = ",", quote = "\"", columnsToKeep = [], matchPattern }: ReadCSVOptions): Promise<any[]> => {
  debug(`readCSV: ${path}`);
  const stream = createReadStream(path);
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  const headers: string[] = [];
  const items = [];
  for await (const line of rl) {
    if (headers.length === 0) {
      headers.push(...csvLineToArray(line, delimiter, quote));
    } else if (!matchPattern || line.match(matchPattern)) {
      items.push(csvLineToArray(line, delimiter, quote));
    }
  }
  return items.map((item) => {
    const r: any = {};
    headers.forEach((header, index) => {
      if (columnsToKeep?.length === 0 || columnsToKeep?.includes(header)) {
        r[header] = item[index];
      }
    });
    return r;
  });
};
