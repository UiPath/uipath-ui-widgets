// Compiles the DataTable's SCSS to CSS: Sass, then the package's PostCSS
// pipeline (`postcss.config.js`). Both run through their Node APIs rather than
// their CLIs, so no child process is spawned — `sass` and `postcss` are `.cmd`
// shims on Windows, which `execFileSync` cannot run without a shell.
import { mkdirSync, readdirSync, writeFileSync } from "fs";
import { basename, join } from "path";
import postcss from "postcss";
import * as sass from "sass";
import postcssConfig from "../postcss.config.js";

const srcDir = "src";
const distDir = "dist";
const componentsDir = join(srcDir, "components");
const distComponentsDir = join(distDir, "components");

const processor = postcss(postcssConfig.plugins);

async function compileScss(inputPath, outputPath) {
  // Same as `sass --no-source-map <input> <output>`.
  const { css } = sass.compile(inputPath, { sourceMap: false });
  // Same as `postcss <output> -o <output>`: `from` is the output file, which
  // the `@source` paths in the stylesheets are written relative to.
  const result = await processor.process(css, {
    from: outputPath,
    to: outputPath,
  });
  // The Sass CLI ends its output with a newline; the API does not.
  writeFileSync(
    outputPath,
    result.css.endsWith("\n") ? result.css : `${result.css}\n`,
  );
}

// Ensure dist/components directory exists
mkdirSync(distComponentsDir, { recursive: true });

// Compile main DataTable.scss
console.log("Compiling DataTable.scss...");
await compileScss(
  join(srcDir, "DataTable.scss"),
  join(distDir, "DataTable.css"),
);

// Compile component styles
const scssFiles = readdirSync(componentsDir).filter((f) => f.endsWith(".scss"));

for (const file of scssFiles) {
  const name = basename(file, ".scss");
  console.log(`Compiling ${file}...`);
  await compileScss(
    join(componentsDir, file),
    join(distComponentsDir, `${name}.css`),
  );
}

console.log("Styles compiled successfully!");
