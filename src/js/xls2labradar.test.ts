import { test, expect, spyOn, afterEach, mock, beforeEach } from "bun:test";
import xls2labradar from './xls2labradar_v2';
import * as download from './download';
import * as csv2labradar from './csv2labradar';

import * as fs from 'fs';

afterEach(function() {
  mock.restore();
})

//currently silently dieing. Seems sheetjs XLSX.read() doesn't play well in such bun test scenarios.
test.todo('file should be nice - ios - de', () => {
  const downloadspy = spyOn(download,'default')
  const csvspy = spyOn(csv2labradar,'default')
  const filename = 'Shotview_i_de.xlsx'
  const data = fs.readFileSync('src/_tests/assets/Shotview_i_de.xlsx', 'utf8');
  const expected1 = fs.readFileSync('src/_tests/assets/Shotview_i_de_xlsx_1.expected.csv', 'utf8');
  const expected2 = fs.readFileSync('src/_tests/assets/Shotview_i_de_xlsx_2.expected.csv', 'utf8');
  const buffer = Buffer.from(data);

  const result:Promise<string> = xls2labradar(buffer.buffer as ArrayBuffer,filename);
  result.then((value) => {
    expect(value).toBe("true");
    expect(csvspy).toHaveBeenCalled();
    expect(downloadspy).toHaveBeenCalled();
    expect(downloadspy.mock.calls[0][1]).toBe('Shotview_a_02-07-2024_17-08-00-xeroconv.csv');
    expect(downloadspy.mock.calls[0][0]).toBe(expected1);
    expect(downloadspy.mock.calls[1][0]).toBe(expected2);
  })
},500)