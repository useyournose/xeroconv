import { quantile } from "./Quantile";
import { medianAbsoluteDeviation } from "./MedianAbsoluteDeviation";

export function fdCount(Values:number[], n:number, range: number ): number {
    // Freedman-Diaconis bin width: 2 * IQR / n^(1/3) -> bins = range / h
    const sorted = [...Values].sort((a, b) => a - b);
    const q1 = quantile(sorted, 0.25);
    const q3 = quantile(sorted, 0.75);
    const iqr = q3 - q1 || medianAbsoluteDeviation(sorted) || 1e-9;
    const h = 2 * iqr / Math.cbrt(n) || range / Math.max(1, Math.cbrt(n));
    const bins = Math.max(1, Math.ceil(range / h));
    return bins;
  }