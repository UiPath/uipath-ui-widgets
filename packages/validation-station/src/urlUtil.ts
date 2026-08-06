/**
 * Joins a base URL and a path segment with exactly one slash between them,
 * regardless of whether `base` already ends in one or `path` already starts
 * with one. Safe for joining a dynamic base — e.g. `getAppBase()`, which
 * returns `/` locally but no trailing slash in production — with a fixed
 * path segment without producing a doubled or missing slash.
 */
export function joinDeploymentUrl(base: string, path: string): string {
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}
