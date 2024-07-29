import {jest,test,expect} from '@jest/globals';
import fit2labradar from './fit2labradar.mjs';
import fs from 'node:fs';
import { promises as fsPromises } from 'fs';
import download from './download.mjs';



async function readFileAsync(filePath) {
  try {
      const data = await fs.promises.readFile(filePath, null);
      return new Uint8Array(data)
  } catch (error) {
      console.error('Error reading file:', error.message);
      return null;
  }
}

test('file should be nice', async () => {
  const filename = '06-18-2024_15-47-11.fit';
  const expected = fs.readFileSync('src/_tests/assets/06-18-2024_15-47-11.expected.csv', 'utf8');

  const arrayBuffer = await readFileAsync('src/_tests/assets/06-18-2024_15-47-11.fit')
  if (arrayBuffer) {
    await fit2labradar(arrayBuffer.buffer,filename);
    expect(download).toHaveBeenCalled();
    expect(download.mock.calls[0][1]).toBe('06-18-2024_15-47-11-xeroconv.csv');
    //expect(download.mock.calls[0][0]).toBe(expected);
  }
});