import { variance } from "./Variance";

// Sample Standard Deviation
export function std(arr: number[], ddof = 0): number {
  return Math.sqrt(variance(arr, ddof));
}
