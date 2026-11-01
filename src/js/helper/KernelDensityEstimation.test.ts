import { expect, test } from 'bun:test';
import { kde } from './KernelDensityEstimation';

test('KDE probability density is independent of repeated shot counts', () => {
  const xs = Array.from({ length: 101 }, (_, index) => index / 10 - 5);
  const shots = [-1, 0, 1];
  const repeatedShots = [...shots, ...shots, ...shots];

  const density = kde(xs, shots, 0.5);
  const repeatedDensity = kde(xs, repeatedShots, 0.5);

  density.forEach((value, index) => {
    expect(repeatedDensity[index]).toBeCloseTo(value, 12);
  });
});

test('KDE density integrates to approximately one', () => {
  const step = 0.01;
  const xs = Array.from({ length: 1001 }, (_, index) => index * step - 5);
  const density = kde(xs, [-1, 0, 1], 0.5);
  const area = density.slice(1).reduce((sum, value, index) => {
    return sum + ((density[index] + value) / 2) * step;
  }, 0);

  expect(area).toBeCloseTo(1, 3);
});
