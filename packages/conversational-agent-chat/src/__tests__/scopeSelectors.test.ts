import postcss from "postcss";
import { describe, expect, it } from "vitest";

import scopeSelectors from "../../../../scripts/postcss-scope-selectors.js";

const ROOT = ".uipath-conversational-agent-chat";

const run = (css: string): string =>
  postcss([scopeSelectors(ROOT)]).process(css, { from: undefined }).css;

describe("postcss-scope-selectors", () => {
  describe("scoping", () => {
    it("scopes a utility class so it cannot outrank a consumer's layered rules", () => {
      // This utility previously overrode host styles document-wide.
      expect(run(".bg-transparent{background-color:#0000}")).toBe(
        `${ROOT} .bg-transparent{background-color:#0000}`,
      );
    });

    it("scopes every selector in the Tailwind preflight reset", () => {
      expect(run("*,::after,::before{margin:0;padding:0}")).toBe(
        `${ROOT} *,${ROOT} ::after,${ROOT} ::before{margin:0;padding:0}`,
      );
    });

    it("scopes arbitrary-variant utilities, whose class name escapes an ampersand", () => {
      // The escaped ampersand is part of the class name, not nesting syntax.
      expect(
        run(String.raw`.hover\:\[\&\>td\]\:bg-x:hover>td{background:red}`),
      ).toBe(
        `${ROOT} ` +
          String.raw`.hover\:\[\&\>td\]\:bg-x:hover>td{background:red}`,
      );
    });

    it("scopes rules inside conditional at-rules", () => {
      expect(run("@media (min-width:40rem){.p-4{padding:1rem}}")).toBe(
        `@media (min-width:40rem){${ROOT} .p-4{padding:1rem}}`,
      );
    });
  });

  describe("document-level and theme selectors", () => {
    it("collapses a bare document-level selector onto the widget root", () => {
      for (const selector of ["html", "body", ":root", ":host"]) {
        expect(run(`${selector}{--radius:0.75rem}`)).toBe(
          `${ROOT}{--radius:0.75rem}`,
        );
      }
    });

    it("keeps a qualified document root as an ancestor and re-targets the widget root", () => {
      // Preserve the ancestor condition so theme tokens reach the widget root.
      expect(run("body.light{--color-background:#fff}")).toBe(
        `body.light ${ROOT}{--color-background:#fff}`,
      );
      // A descendant part stays after the re-targeted root.
      expect(run("body.dark .panel{color:#fff}")).toBe(
        `body.dark ${ROOT} .panel{color:#fff}`,
      );
    });

    it("treats apollo-wind theme-class heads as ancestors", () => {
      expect(run(".future-dark{--x:1}")).toBe(`.future-dark ${ROOT}{--x:1}`);
      expect(run(".wireframe *::before{border:none}")).toBe(
        `.wireframe ${ROOT} *::before{border:none}`,
      );
      // Avoid treating similarly named classes as themes.
      expect(run(".lightbox{opacity:1}")).toBe(`${ROOT} .lightbox{opacity:1}`);
    });
  });

  describe("rules left alone", () => {
    it("is idempotent for selectors already containing the root", () => {
      const css = `${ROOT} .info-container{display:flex}`;
      expect(run(css)).toBe(css);
      expect(run(run(css))).toBe(css);
    });

    it("leaves nesting selectors to resolve against their scoped parent", () => {
      const out = run(".card{color:red;[data-slot=x] &{color:blue}}");
      expect(out).toContain(`${ROOT} .card`);
      expect(out).toContain("[data-slot=x] &");
      expect(out).not.toContain(`${ROOT} [data-slot=x]`);
    });

    it("leaves keyframe offsets untouched", () => {
      expect(run("@keyframes spin{from{opacity:0}to{opacity:1}}")).toBe(
        "@keyframes spin{from{opacity:0}to{opacity:1}}",
      );
    });
  });
});
