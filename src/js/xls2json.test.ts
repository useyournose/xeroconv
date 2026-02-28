import { test, expect, spyOn, afterEach, mock, beforeEach } from "bun:test";
import xls2json from './xls2json';
import * as csv2json from './csv2json';

import * as fs from 'fs';
import { ShotEntry, ShotSession } from "./_types";

afterEach(function() {
  mock.restore();
})

//currently silently dieing. Seems sheetjs XLSX.read() doesn't play well in such bun test scenarios.
test('file should be nice - ios - de', async () => {
  expect.hasAssertions();
  const csvspy = spyOn(csv2json,'default')
  const filename = 'Shotview_i_de.xlsx'
  const probepath = 'src/_tests/assets/Shotview_i_de.xlsx'
  const expectationpath_1 = 'src/_tests/assets/Shotview_i_de_xlsx_1.expected.json'
  const expectationpath_2 = 'src/_tests/assets/Shotview_i_de_xlsx_2.expected.json'

  //const data = fs.readFileSync(, 'utf8');
  //const expected1 = fs.readFileSync('src/_tests/assets/Shotview_i_de_xlsx_1.expected.csv', 'utf8');
  //const expected2 = fs.readFileSync('src/_tests/assets/Shotview_i_de_xlsx_2.expected.csv', 'utf8');
  //const buffer = Buffer.from(data);

  await Promise.all([
    //xls2json(buffer.buffer as ArrayBuffer,filename),
    xls2json((await Bun.file(probepath).arrayBuffer()), filename),
    Bun.file(expectationpath_1).json(),
    Bun.file(expectationpath_2).json(),
  ])
  .then(([probe, expectation_1, expectation_2]) => {
    expect(csvspy).toHaveBeenCalled();
    expect(probe[0]).toEqual(expectation_1);
    expect(probe[1]).toEqual(expectation_2);
  })
},500)