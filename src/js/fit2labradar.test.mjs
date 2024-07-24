import {jest,test,expect} from '@jest/globals';
import fit2labradar from './fit2labradar.mjs';
import fs from 'node:fs';
import { Buffer } from 'node:buffer';
import download from './download.mjs';



async function readFileAsync(filePath) {
  try {
      const data = await fs.readFile(filePath, 'binary');
      const buffer = Buffer.from(data, 'binary');
      return buffer.buffer;
  } catch (error) {
      console.error('Error reading file:', error.message);
      return null;
  }
}

test('file should be nice', () => {
  const filename = '06-18-2024_15-47-11.fit';
  const expected = fs.readFileSync('src/_tests/assets/Shotview_a.expected.csv', 'utf8');
  const data = fs.readFileSync('src/_tests/assets/06-18-2024_15-47-11.fit',null);
  //const data = fs.readFileSync('src/_tests/assets/Shotview_a.csv', 'utf8');
  //const buf = Buffer.from(data);
  //const hbuf = Buffer.from(data,'hex');
  //const arr = new Uint8Array(buf.buffer,buf.byteOffset, buf.length / Uint8Array.BYTES_PER_ELEMENT)
  readFileAsync('src/_tests/assets/06-18-2024_15-47-11.fit')
  .then(arrayBuffer => {
  fit2labradar(arrayBuffer,filename);
  })
});