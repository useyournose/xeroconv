import {test,expect, mock, spyOn, afterEach, beforeAll, setSystemTime} from 'bun:test';
import fit2json from './fit2json';

beforeAll(() => {
  setSystemTime(new Date("2024-01-01T00:00:00.000B"));
  mock.restore();
});

test('file should be nice', async () => {
  expect.hasAssertions();
  const filename = '06-18-2024_15-47-11.fit';
  const probepath = 'src/_tests/assets/06-18-2024_15-47-11.fit'
  const expectationpath = 'src/_tests/assets/06-18-2024_15-47-11.expected.json'
  await Promise.all([
      fit2json(await Bun.file(probepath).arrayBuffer(), filename),
      Bun.file(expectationpath).json()
    ]).then(([probe,expected]) => {
      expect(probe).toEqual(expected)
    })

});

test('file should be nice 2', async () => {
  expect.hasAssertions();
  const filename = '06-18-2024_15-47-11.fit';
  const probepath = 'src/_tests/assets/08-10-2026_10-44-31.fit'
  const expectationpath = 'src/_tests/assets/08-10-2026_10-44-31.expected.json'
  await Promise.all([
      fit2json(await Bun.file(probepath).arrayBuffer(), filename),
      Bun.file(expectationpath).json()
    ]).then(([probe,expected]) => {
      expect(probe).toEqual(expected)
    })

});

test('file should fail - currupt', async () => {
  expect.hasAssertions();
  const filename = 'broken.fit';
  const filepath = 'src/_tests/assets/broken.fit'
  expect(
    fit2json(
      await Bun.file(filepath).arrayBuffer(), filename
    )
  ).rejects.toThrow("Error: broken.fit - not a working fit file.");
});

test('file should fail - no shots data', async () => {
  expect.hasAssertions();
  const filename = 'noshots.fit';
  const filepath = 'src/_tests/assets/noshots.fit'
  expect(
    fit2json(
      await Bun.file(filepath).arrayBuffer(), filename
    )
  ).rejects.toThrow("Error: noshots.fit does not contain shot sessions.");
});