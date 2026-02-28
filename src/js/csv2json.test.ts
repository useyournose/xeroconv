import { test, expect} from "bun:test";
import * as fs from 'fs';
import csv2json from './csv2json';

test('file should be nice - android', async () => {
  expect.hasAssertions();
  const expectationfile = Bun.file('src/_tests/assets/Shotview_a.expected.json');
  const filename = 'Shotview_a.csv'
  const data = fs.readFileSync('src/_tests/assets/Shotview_a.csv', 'utf8');
  const buffer = Buffer.from(data);

  await Promise.all([
    csv2json(buffer.buffer as ArrayBuffer,filename),
    expectationfile.json()
  ]).then(([probe,expected]) => {
    expect(probe).toEqual(expected)
  })
});

test('file should be nice - ios', async () => {
  expect.hasAssertions();
  const expectationfile = Bun.file('src/_tests/assets/Shotview_i.expected.json');
  const filename = 'Shotview_i.csv'
  const data = fs.readFileSync('src/_tests/assets/Shotview_i.csv', 'utf8');
  const buffer = Buffer.from(data);

  await Promise.all([
    csv2json(buffer.buffer as ArrayBuffer,filename),
    expectationfile.json()
  ]).then(([probe,expected]) => {
    expect(probe).toEqual(expected)
  })
});

test('file should be nice - ios - de', async () => {
  expect.hasAssertions();
  const filename = 'Shotview_i_de.csv'
  const expectationfile = Bun.file('src/_tests/assets/Shotview_i_de.expected.json');
  const data = fs.readFileSync('src/_tests/assets/Shotview_i_de.csv', 'utf8');
  const buffer = Buffer.from(data);

  await Promise.all([
    csv2json(buffer.buffer as ArrayBuffer,filename),
    expectationfile.json()
  ]).then(([probe,expected]) => {
    expect(probe).toEqual(expected)
  })
});

test('file should throw', async() => {
  expect.hasAssertions();
  const filename = 'Shotview_brokendate.csv'
  const data = fs.readFileSync('src/_tests/assets/Shotview_a_brokendate.csv', 'utf8');
  const buffer = Buffer.from(data);

  await csv2json(buffer.buffer as ArrayBuffer,filename)
  .then(val => expect(val).fail()
  )
  .catch((error) => {
    expect(error).toBe('Date Quarz 02,2024 17:08 does not parse. Ping the dev on github.');
  })
});
