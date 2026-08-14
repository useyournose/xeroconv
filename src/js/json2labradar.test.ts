import {test,expect, mock, spyOn, afterEach, beforeAll, setSystemTime} from 'bun:test';
import { json2Labradar } from './json2labradar';
import * as fs from 'fs';
import * as download from './download';
import * as Messages from './messages';
import { arrayBuffer } from 'stream/consumers';
import { ShotSession } from './_types';

async function readFileAsync(filePath:string) {
  try {
      const data = await fs.promises.readFile(filePath, null);
      return new Uint8Array(data)
  } catch (error) {
      console.error('Error reading file:', error.message);
      return null;
  }
}

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