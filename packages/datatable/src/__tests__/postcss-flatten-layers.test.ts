import { describe, expect, it } from "vitest";
import postcss from "postcss";
import flattenLayers from "../../../../scripts/postcss-flatten-layers.js";

const run = async (input: string) => {
  const result = await postcss([flattenLayers()]).process(input, {
    from: undefined,
  });
  return result.css.trim();
};

describe("postcss-flatten-layers", () => {
  it("removes @layer block wrappers and keeps inner rules", async () => {
    const out = await run(`
      @layer base { .foo { color: red; } }
      @layer utilities { .bar { padding: 1rem; } }
    `);
    expect(out).toContain(".foo { color: red; }");
    expect(out).toContain(".bar { padding: 1rem; }");
    expect(out).not.toMatch(/@layer\s+\w+\s*\{/);
  });

  it("leaves declaration-only @layer statements alone", async () => {
    const out = await run(`
      @layer properties;
      @layer theme, base, components, utilities;
      .foo { color: red; }
    `);
    expect(out).toContain("@layer properties;");
    expect(out).toContain("@layer theme, base, components, utilities;");
    expect(out).toContain(".foo { color: red; }");
  });

  it("flattens nested @layer blocks", async () => {
    const out = await run(`
      @layer outer { @layer inner { .deep { display: block; } } }
    `);
    expect(out).toContain(".deep { display: block; }");
    expect(out).not.toMatch(/@layer\s+\w+\s*\{/);
  });

  it("preserves @media and @supports queries", async () => {
    const out = await run(`
      @layer base {
        @media (min-width: 600px) { .wide { font-size: 1.25rem; } }
        @supports (display: grid) { .grid { display: grid; } }
      }
    `);
    expect(out).toContain("@media (min-width: 600px)");
    expect(out).toContain(".wide { font-size: 1.25rem; }");
    expect(out).toContain("@supports (display: grid)");
    expect(out).toContain(".grid { display: grid; }");
    expect(out).not.toMatch(/@layer\s+\w+\s*\{/);
  });

  it("removes empty @layer blocks entirely", async () => {
    const out = await run(`
      @layer base {}
      .keep { color: red; }
    `);
    expect(out).not.toContain("@layer");
    expect(out).toContain(".keep { color: red; }");
  });
});
