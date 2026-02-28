import { mean } from "./mean";

export function variance(arr: number[], ddof = 0): number {
  if (arr.length - ddof <= 0) return 0;
  const m = mean(arr);
  return arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - ddof);
}