import {expect, jest, test} from '@jest/globals';
import csv2labradar from './csv2labradar.mjs';
import download from './download.mjs';

import fs from 'node:fs';

test('file should be nice', () => {
  const filename = 'Shotview_a.csv'
  const data = fs.readFileSync('src/_tests/assets/Shotview_a.csv', 'utf8');
  const expected = fs.readFileSync('src/_tests/assets/Shotview_a.expected.csv', 'utf8');
  const buffer = Buffer.from(data);
 
  csv2labradar(buffer,filename);
  expect(download).toHaveBeenCalled();
  expect(download.mock.calls[0][1]).toBe('Shotview_a_02-07-2024_17-08-00-xeroconv.csv');
  expect(download.mock.calls[0][0]).toBe(expected);
});