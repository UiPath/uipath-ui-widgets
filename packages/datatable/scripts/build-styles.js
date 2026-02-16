import { execSync } from "child_process";
import { mkdirSync, readdirSync } from "fs";
import { basename, join } from "path";

const srcDir = "src";
const distDir = "dist";
const componentsDir = join(srcDir, "components");
const distComponentsDir = join(distDir, "components");

function compileScss(inputPath, outputPath) {
  execSync(`sass --no-source-map ${inputPath} | postcss -o ${outputPath}`, {
    shell: true,
    stdio: "inherit",
  });
}

// Ensure dist/components directory exists
mkdirSync(distComponentsDir, { recursive: true });

// Compile main DataTable.scss
console.log("Compiling DataTable.scss...");
compileScss(join(srcDir, "DataTable.scss"), join(distDir, "DataTable.css"));

// Compile component styles
const scssFiles = readdirSync(componentsDir).filter((f) => f.endsWith(".scss"));

for (const file of scssFiles) {
  const name = basename(file, ".scss");
  console.log(`Compiling ${file}...`);
  compileScss(
    join(componentsDir, file),
    join(distComponentsDir, `${name}.css`),
  );
}

console.log("Styles compiled successfully!");
