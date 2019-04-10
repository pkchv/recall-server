import s from "shelljs";

// tslint:disable-next-line:no-var-requires
const tsconfig = require("./tsconfig.json");
const outDir = tsconfig.compilerOptions.outDir;

s.rm("-rf", outDir);
s.mkdir(outDir);
s.cp(".env", `${outDir}/.env`);
