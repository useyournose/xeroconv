import {test, expect, spyOn, afterEach, mock} from 'bun:test';
import download from './downloadhandler';
import * as Messages from './messages';

const messagespy = spyOn(Messages, "showSuccess")
const logspy = spyOn(global.console,'log')

afterEach(function() {
  mock.restore();
})

test('downloads an already-converted file', async () => {
  const filename = 'Shotview_a_02-07-2024_17-08-00-xeroconv.csv';
  const contents = await Bun.file('src/_tests/assets/Shotview_a.expected.csv').text();
  const file = new File([contents], filename, {type: 'text/csv'});

  await expect(download([file])).resolves.toBe(true);
  expect(messagespy).toHaveBeenCalledTimes(1);
  expect(messagespy).toHaveBeenCalledWith(`Saved ${filename}.`);
  expect(logspy).toHaveBeenCalledTimes(1);
  expect(logspy).toHaveBeenCalledWith(`[download]: file ${filename} saved.`);
});