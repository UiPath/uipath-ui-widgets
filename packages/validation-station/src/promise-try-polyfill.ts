// zone.js replaces the global Promise with ZoneAwarePromise, which lacks
// Promise.try(). The DU validation station WC (Angular/PDF.js) calls
// Promise.try() at runtime. This module restores it after zone.js loads.
// Remove when the WC ships a zone.js version that includes Promise.try().
if (typeof (Promise as any).try !== "function") {
  (Promise as any).try = function <T>(
    fn: () => T | PromiseLike<T>,
  ): Promise<T> {
    return new Promise<T>((resolve) => resolve(fn()));
  };
}
