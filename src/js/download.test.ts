import {test, expect, spyOn, afterEach, mock} from 'bun:test';
import download from './download';
import * as Messages from './messages';

const messagespy = spyOn(Messages, "showSuccess")
const logspy = spyOn(global.console,'log')

afterEach(function() {
  mock.restore();
})

test('download test', () => {

  const filename:string = 'test123.csv'
  const text:string = 'testdata'
  const testarg:string = '[download]: file '+filename+' saved.'
  
  download(text,filename);
  
  expect(messagespy).toHaveBeenCalledTimes(1);
  expect(logspy).toHaveBeenCalledTimes(1);
  expect(logspy.mock.calls.at(0).toString()).toBe(testarg);
});