import "dotenv/config";

import Debug from "debug";
import cors from "cors";
import express, { Express, Request, Response } from "express";
import helmet from "helmet";

import * as db from "./lib/db";

import * as shortlist from "./services/shortlist";
import * as villes from "./services/villes";

const debug = Debug("mbtf:API:index");
const app: Express = express();
const port: number = parseInt(process.env.PORT || "5001", 10);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/villes", async (req: Request, res: Response) => {
  debug(`GET /villes ${JSON.stringify(req.query)}`);
  try {
    res.json(await villes.listVilles(req.query));
  } catch (ex) {
    debug(ex);
    res.status(500).json({ ex });
  }
});

app.get("/ville", async (req: Request, res: Response) => {
  debug(`GET /ville ${JSON.stringify(req.query)}`);
  try {
    res.json(await villes.getVille(req.query));
  } catch (ex) {
    debug(ex);
    res.status(500).json({ ex });
  }
});

app.get("/carte", async (req: Request, res: Response) => {
  debug("GET /carte");
  try {
    res.json(await villes.listVillesPourCarte(req.query));
  } catch (ex) {
    debug(ex);
    res.status(500).json({ ex });
  }
});

app.get("/shortlist", async (req: Request, res: Response) => {
  debug("GET /shortlist");
  try {
    res.json(await shortlist.getShortlist());
  } catch (ex) {
    debug(ex);
    res.status(500).json({ ex });
  }
});

app.post("/shortlist", async (req: Request, res: Response) => {
  debug("POST /shortlist");
  try {
    console.log(req.body);
    res.json(await shortlist.updateShortlist(req.body));
  } catch (ex) {
    debug(ex);
    res.status(500).json({ ex });
  }
});

app.listen(port, async () => {
  await db.connect();
  debug(`Server running on port: ${port}`);
});
