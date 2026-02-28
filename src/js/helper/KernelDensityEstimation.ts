import { gaussianKernel } from "./GaussianKernel";

export function kde(xs: number[], data: number[], bandwidth: number): number[] {
  return xs.map(x =>
    data.reduce((sum, xi) => sum + gaussianKernel((x - xi) / bandwidth), 0) /
    (data.length * bandwidth)
  );
}