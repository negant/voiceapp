/**
 * Compare dotted version strings (e.g. 1.0.0 vs 1.2.3).
 * Returns negative if a < b, 0 if equal, positive if a > b.
 */
export function compareSemver(a: string, b: string): number {
  const pa = a.trim().split(/[.+-]/).map(part => Number.parseInt(part, 10) || 0);
  const pb = b.trim().split(/[.+-]/).map(part => Number.parseInt(part, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i += 1) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da !== db) {
      return da - db;
    }
  }
  return 0;
}
