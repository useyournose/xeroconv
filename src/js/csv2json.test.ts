import { test, expect} from "bun:test";
import csv2json from './csv2json';

test('file should be nice - android', async () => {
  expect.hasAssertions();
  const expectationfile = Bun.file('src/_tests/assets/Shotview_a.expected.json');
  const filename = 'Shotview_a.csv'
  await Promise.all([
    csv2json(await Bun.file('src/_tests/assets/Shotview_a.csv').arrayBuffer(),filename),
    expectationfile.json()
  ]).then(([probe,expected]) => {
    expect(probe).toEqual(expected)
  })
});

test('file should be nice - ios', async () => {
  expect.hasAssertions();
  const expectationfile = Bun.file('src/_tests/assets/Shotview_i.expected.json');
  const filename = 'Shotview_i.csv'
  await Promise.all([
    csv2json(await Bun.file('src/_tests/assets/Shotview_i.csv').arrayBuffer(),filename),
    expectationfile.json()
  ]).then(([probe,expected]) => {
    expect(probe).toEqual(expected)
  })
});

test('file should be nice - ios - de', async () => {
  expect.hasAssertions();
  const filename = 'Shotview_i_de.csv'
  const expectationfile = Bun.file('src/_tests/assets/Shotview_i_de.expected.json');
  await Promise.all([
    csv2json(await Bun.file('src/_tests/assets/Shotview_i_de.csv').arrayBuffer(),filename),
    expectationfile.json()
  ]).then(([probe,expected]) => {
    expect(probe).toEqual(expected)
  })
});

test('file should throw', async() => {
  expect.hasAssertions();
  const filename = 'Shotview_brokendate.csv'
  await csv2json(await Bun.file('src/_tests/assets/Shotview_a_brokendate.csv').arrayBuffer(),filename)
  .then(val => expect(val).fail()
  )
  .catch((error) => {
    expect(error).toBe('Date Quarz 02,2024 17:08 does not parse. Ping the dev on github.');
  })
});
