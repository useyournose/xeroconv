import {test,expect, mock, jest} from 'bun:test';
import fit2labradar from './fit2labradar';
import fs from 'node:fs';
import download from './download';
import { showError } from './messages';


const mockedFunction = mock((text:string, filname: string) => {});
async function readFileAsync(filePath:string) {
  try {
      const data = await fs.promises.readFile(filePath, null);
      return new Uint8Array(data)
  } catch (error) {
      console.error('Error reading file:', error.message);
      return null;
  }
}

test.skip('file should be nice', async () => {
  /*const download = mock.module("./download", () => ({
    download: (stream:string, filename:string) => {},
  })) as unknown as jest.Mock;*/
  const download = mock.module("./download", () => {
    return {
    default: mockedFunction,
    download: mockedFunction,
    mock: mockedFunction
    };
   });
  const filename = '06-18-2024_15-47-11.fit';
  const expected = fs.readFileSync('src/_tests/assets/06-18-2024_15-47-11.expected.csv', 'utf8');

  const arrayBuffer = await readFileAsync('src/_tests/assets/06-18-2024_15-47-11.fit')
  if (arrayBuffer) {
    await fit2labradar(arrayBuffer.buffer as ArrayBuffer,filename);
    expect(download).toHaveBeenCalled();
    expect(download.mock.calls[0][1]).toBe('06-18-2024_15-47-11-xeroconv.csv');
  }
});

test.skip('file should fail', async () => {
  const showError = mock.module("./messages", () => {return {showError: () => true}}) as unknown as jest.Mock;
  const download = mock.module("./download", ():void => {}) as unknown as jest.Mock;
  const filename = 'noshots.fit';
  const arrayBuffer = await readFileAsync('src/_tests/assets/noshots.fit')
  if (arrayBuffer) {
    await fit2labradar(arrayBuffer.buffer as ArrayBuffer,filename);
    expect(download).not.toHaveBeenCalled();
    expect(showError).toBeCalled();
    expect(showError.mock.calls[0][0]).toBe("Error: noshots.fit does not contain shot sessions file.")
  }
});