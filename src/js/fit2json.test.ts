import {test,expect, mock, spyOn, afterEach, beforeAll, setSystemTime} from 'bun:test';
import fit2json from './fit2json';
import * as fs from 'fs';
import * as download from './download';
import * as Messages from './messages';
import { arrayBuffer } from 'stream/consumers';

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

test('file should be nice', async () => {
  expect.hasAssertions();
  const filename = '06-18-2024_15-47-11.fit';
  const probepath = 'src/_tests/assets/06-18-2024_15-47-11.fit'
  const expectationpath = 'src/_tests/assets/06-18-2024_15-47-11.expected.json'
  await Promise.all([
      fit2json((await readFileAsync(probepath)).buffer as ArrayBuffer,filename),
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
      (await readFileAsync(filepath)).buffer as ArrayBuffer,filename
    )
  ).rejects.toThrow("Error: broken.fit - not a working fit file.");
});

test('file should fail - no shots data', async () => {
  expect.hasAssertions();
  const filename = 'noshots.fit';
  const filepath = 'src/_tests/assets/noshots.fit'
  expect(
    fit2json(
      (await readFileAsync(filepath)).buffer as ArrayBuffer,filename
    )
  ).rejects.toThrow("Error: noshots.fit does not contain shot sessions.");
});