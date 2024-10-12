import { test, expect, jest } from "bun:test";
import csv2labradar from './csv2labradar';
import download from './download';


//import download from './__mocks__/download'
//jest.mock('./download', () => jest.fn());


import fs from 'node:fs';

test.skip('file should be nice', () => {
  const filename = 'Shotview_a.csv'
  const data = fs.readFileSync('src/_tests/assets/Shotview_a.csv', 'utf8');
  const expected = fs.readFileSync('src/_tests/assets/Shotview_a.expected.csv', 'utf8');
  const buffer = Buffer.from(data);
  const mockeddownload = download as jest.Mock;
  (download as unknown as jest.Mock);
  csv2labradar(buffer.buffer as ArrayBuffer,filename);
  expect(mockeddownload).toHaveBeenCalled();
  expect(mockeddownload.mock.calls[0][1]).toBe('Shotview_a_02-07-2024_17-08-00-xeroconv.csv');
  expect(mockeddownload.mock.calls[0][0]).toBe(expected);
});