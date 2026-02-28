export function gaussianKernel(u: number): number {
  return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * u * u);
}