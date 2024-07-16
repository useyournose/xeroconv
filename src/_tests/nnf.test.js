const nnf = require('../js/nnf');

test('1,00 should become 1', () => {
  expect(nnf('1,23')).toBe(1.23);
});

test('blank should become 0', () => {
  expect(nnf(' ')).toBe(0);
});

test('number should stay a number', () => {
  expect(nnf(1.123)).toBe(1.123);
});

test('null should become 0', () => {
  expect(nnf()).toBe(0);
});