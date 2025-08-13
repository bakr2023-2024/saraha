"use strict";
import * as dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.join("./src/config/.env.dev") });
import bootstrap from "./app.controller.js";
bootstrap();
