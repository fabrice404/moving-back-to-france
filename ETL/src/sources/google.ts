import axios from "axios";
import * as cliProgress from "cli-progress";
import Debug from "debug";
import path from "path";

import * as io from "../lib/io";

const debug = Debug("mbtf:ETL:sources/bpe");

export const nearbySearch = async (types: string[], latitude: number, longitude: number) => {

  const key = types.join("-") + "-" + latitude.toString().replace(".", "_") + "-" + longitude.toString().replace(".", "_");
  const cachePath = path.join(__dirname, `../../../data/google/${key}.json`);
  if (io.hasFile(cachePath)) {
    return JSON.parse(io.readFile(cachePath));
  }
  const data = {
    includedTypes: types,
    locationRestriction: {
      circle: {
        center: {
          latitude,
          longitude,
        },
        radius: 5000,
      },
    },
  };
  const headers = {
    "X-Goog-FieldMask": "*",
    "X-Goog-Api-Key": process.env.GOOGLE_API_KEY,
  };

  const response = await axios.post(
    "https://places.googleapis.com/v1/places:searchNearby",
    data,
    { headers },
  );

  const result = response.data?.places || [];
  io.saveFile(
    cachePath,
    JSON.stringify(result),
  );
  return result;
};
