import { test, expect, spyOn, afterEach, mock, beforeEach } from "bun:test";
import csv2labradar from './csv2labradar';
import * as download from './download';

import * as fs from 'fs';

afterEach(function() {
  mock.restore();
})

test('file should be nice - android', () => {
  const downloadspy = spyOn(download,'default')
  const filename = 'Shotview_a.csv'
  const data = fs.readFileSync('src/_tests/assets/Shotview_a.csv', 'utf8');
  const expected = fs.readFileSync('src/_tests/assets/Shotview_a.expected.csv', 'utf8');
  const buffer = Buffer.from(data);

  const result:Promise<string> = csv2labradar(buffer.buffer as ArrayBuffer,filename);
  result.then((value) => {
    expect(value).toBe('true');
    expect(downloadspy).toHaveBeenCalled();
    expect(downloadspy.mock.calls[0][1]).toBe('Shotview_a_02-07-2024_17-08-00-xeroconv.csv');
    expect(downloadspy.mock.calls[0][0]).toBe(expected);
  })
});

test('file should be nice - ios', () => {
  const downloadspy = spyOn(download,'default')
  const filename = 'Shotview_i.csv'
  const data = fs.readFileSync('src/_tests/assets/Shotview_i.csv', 'utf8');
  const expected = fs.readFileSync('src/_tests/assets/Shotview_i.expected.csv', 'utf8');
  const buffer = Buffer.from(data);

  const result:Promise<string> = csv2labradar(buffer.buffer as ArrayBuffer,filename);
  result.then((value) => {
    expect(value).toBe('true');
    expect(downloadspy).toHaveBeenCalled();
    expect(downloadspy.mock.calls[0][1]).toBe('Shotview_i_06-04-2024_13-36-00-xeroconv.csv');
    expect(downloadspy.mock.calls[0][0]).toBe(expected);
  })
});

test('file should be nice - ios - de', () => {
  const downloadspy = spyOn(download,'default')
  const filename = 'Shotview_i_de.csv'
  const data = fs.readFileSync('src/_tests/assets/Shotview_i_de.csv', 'utf8');
  const expected = fs.readFileSync('src/_tests/assets/Shotview_i_de.expected.csv', 'utf8');
  const buffer = Buffer.from(data);

  const result:Promise<string> = csv2labradar(buffer.buffer as ArrayBuffer,filename);
  result.then((value) => {
    expect(value).toBe('true');
    expect(downloadspy).toHaveBeenCalled();
    expect(downloadspy.mock.calls[0][1]).toBe('Shotview_i_de_08-02-2025_10-08-00-xeroconv.csv');
    expect(downloadspy.mock.calls[0][0]).toBe(expected);
  })
});

test('file should throw', () => {
  const downloadspy = spyOn(download,'default')
  const filename = 'Shotview_brokendate.csv'
  const data = fs.readFileSync('src/_tests/assets/Shotview_a_brokendate.csv', 'utf8');
  const buffer = Buffer.from(data);

  const result:Promise<string> = csv2labradar(buffer.buffer as ArrayBuffer,filename);
  result.then((value) => {
    expect(value).toBe("false")
  }).catch((error) => {
    expect(downloadspy).not.toHaveBeenCalled();
    expect(error).toBe('Date Quarz 02,2024 17:08 does not parse. Ping the dev on github.');
  })
});
