import {test, expect, spyOn, afterEach, mock} from 'bun:test';
import download from './downloadhandler';
//import csv2labradar from './csv2labradar';
import * as Messages from './messages';

import * as fs from 'fs';

const messagespy = spyOn(Messages, "showSuccess")
const logspy = spyOn(global.console,'log')

afterEach(function() {
  mock.restore();
})

test.todo('file should be nice - android', () => {
  const filename = 'Shotview_a.csv'
  const data = fs.readFileSync('src/_tests/assets/Shotview_a.csv', 'utf8');
  const expected = fs.readFileSync('src/_tests/assets/Shotview_a.expected.csv', 'utf8');
  const buffer = Buffer.from(data);

  const results:File[] = []

  const result:Promise<File> = csv2labradar(buffer.buffer as ArrayBuffer,filename);
  result.then((file) => results.push(file)).then((number) => download(results).then((value) => {
    expect(value).toBe(true);
    expect(messagespy).toHaveBeenCalledTimes(1);
    expect(messagespy.mock.calls.at(0).toString()).toBe('Saved Shotview_a_02-07-2024_17-08-00-xeroconv.csv.');
    expect(logspy.mock.calls.at(1).toString()).toBe('[download]: file Shotview_a_02-07-2024_17-08-00-xeroconv.csv saved.');
    expect(logspy).toHaveBeenCalledTimes(2);
  }))
});