import {test,expect, mock, beforeAll, setSystemTime} from 'bun:test';
import { json2Labradar } from './json2labradar';
import { ShotSession } from './_types';

beforeAll(() => {
  setSystemTime(new Date("2024-01-01T00:00:00.000B"));
  mock.restore();
});

test('fit should convert properly', async () => {
  expect.hasAssertions();
  const probepath = 'src/_tests/assets/06-18-2024_15-47-11.expected.json'
  const expectedpath = 'src/_tests/assets/06-18-2024_15-47-11-xeroconv.expected.csv'
  await Promise.all([
      await (await json2Labradar( await Bun.file(probepath).json() as ShotSession )).text(),
      Bun.file(expectedpath).text()
    ]).then(([probe,expected]) => {
      expect(probe).toEqual(expected)
    })
});

test('fit should convert properly 2', async () => {
  expect.hasAssertions();
  const probepath = 'src/_tests/assets/08-10-2026_10-44-31.expected.json'
  const expectedpath = 'src/_tests/assets/08-10-2026_10-44-31-xeroconv.expected.csv'
  await Promise.all([
      await (await json2Labradar( await Bun.file(probepath).json() as ShotSession )).text(),
      Bun.file(expectedpath).text()
    ]).then(([probe,expected]) => {
      expect(probe).toEqual(expected)
    })
});