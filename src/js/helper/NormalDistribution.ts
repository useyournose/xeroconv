export function normalPDF(x: number, mu: number, sigma: number): number {
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) *
         Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
}
