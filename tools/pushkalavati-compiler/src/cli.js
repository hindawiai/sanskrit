#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compileAll, writeOutputs } from "./compile.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ir = await compileAll(path.join(root, "data", "sutras.json"));
const report = await writeOutputs(ir, path.join(root, "out"));
console.log(JSON.stringify(report, null, 2));
