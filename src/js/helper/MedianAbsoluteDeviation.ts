import { quantile } from "./Quantile";
export function medianAbsoluteDeviation(sorted: number[]) {
    const med = quantile(sorted, 0.5);
    const devs = sorted.map(v => Math.abs(v - med)).sort((a, b) => a - b);
    return quantile(devs, 0.5);
}