import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import postcss from "postcss";
import type { AtRule, Container, Document } from "postcss";
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

    it("scopes the Tailwind preflight reset", () => {
      expect(run("*,::after,::before{margin:0;padding:0}")).toBe(
        `${ROOT} *,${ROOT} ::after,${ROOT} ::before{margin:0;padding:0}`,
      );
    });

    it("scopes type, attribute and legacy pseudo-element selectors", () => {
      expect(run("hr{height:0}")).toBe(`${ROOT} hr{height:0}`);
      expect(run("[hidden]{display:none}")).toBe(
        `${ROOT} [hidden]{display:none}`,
      );
      expect(run('.icon-add:before{content:"a"}')).toBe(
        `${ROOT} .icon-add:before{content:"a"}`,
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
      expect(run("html[dir='rtl']{--m:4px}")).toBe(
        `html[dir='rtl'] ${ROOT}{--m:4px}`,
      );
    });

    it("treats apollo-wind theme-class heads as ancestors", () => {
      expect(run(".future-dark{--x:1}")).toBe(`.future-dark ${ROOT}{--x:1}`);
      expect(run(".light:not(.react-flow){--x:1}")).toBe(
        `.light:not(.react-flow) ${ROOT}{--x:1}`,
      );
      expect(run(".wireframe *::before{border:none}")).toBe(
        `.wireframe ${ROOT} *::before{border:none}`,
      );
      // Avoid treating similarly named classes as themes.
      expect(run(".lightbox{opacity:1}")).toBe(`${ROOT} .lightbox{opacity:1}`);
    });

    it("keeps a descendant part after the re-targeted root", () => {
      expect(run("body.dark .panel{color:#fff}")).toBe(
        `body.dark ${ROOT} .panel{color:#fff}`,
      );
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

    it("leaves at-rules that register names rather than match elements", () => {
      const property = '@property --x{syntax:"<length>";inherits:false}';
      expect(run(property)).toBe(property);
      const fontFace = "@font-face{font-family:x;src:url(x.woff2)}";
      expect(run(fontFace)).toBe(fontFace);
    });
  });

  describe("the built artifact", () => {
    // Verify the built stylesheet contains no unscoped top-level selectors.
    const distCss = resolve(
      __dirname,
      "../../dist/ConversationalAgentChat.css",
    );

    it.skipIf(!existsSync(distCss))(
      "leaves no top-level selector unscoped",
      () => {
        const leaked: string[] = [];
        postcss.parse(readFileSync(distCss, "utf8")).walkRules((rule) => {
          for (
            let node: Container | Document | undefined = rule.parent;
            node;
            node = node.parent
          ) {
            // Keyframe offsets and nested rules are not top-level selectors.
            if (
              node.type === "atrule" &&
              /keyframes/i.test((node as AtRule).name)
            ) {
              return;
            }
            if (node.type === "rule") return;
          }
          leaked.push(...rule.selectors.filter((s) => !s.includes(ROOT)));
        });
        expect(leaked).toEqual([]);
      },
    );

    it.skipIf(!existsSync(distCss))("ships no CJK body-font catalogs", () => {
      // Font stacks may name Noto Sans; the removed @font-face catalogs must not ship.
      const css = readFileSync(distCss, "utf8");
      const cjkFaces: string[] = [];
      postcss.parse(css).walkAtRules("font-face", (rule) => {
        const family = rule.toString();
        if (/Noto Sans (JP|KR|SC|TC)/.test(family))
          cjkFaces.push(family.slice(0, 80));
      });
      expect(cjkFaces).toEqual([]);
    });
  });
});
