export function normalizeUnixTimestamp(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const absValue = Math.abs(value);
  if (absValue >= 1e12) {
    return Math.trunc(value / 1000);
  }

  return Math.trunc(value);
}
