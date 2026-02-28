/** Generate CRC32 table once */
const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
})();

/** Compute CRC32 for ArrayBuffer, returns unsigned 32-bit integer */
export function crc32(buffer: ArrayBuffer): number {
  const bytes = new Uint8Array(buffer);
  let crc = 0xFFFFFFFF >>> 0;
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    crc = (CRC32_TABLE[(crc ^ byte) & 0xFF] ^ (crc >>> 8)) >>> 0;
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

/** Optional: return CRC32 as 8-char hex */
export function crc32Hex(buffer: ArrayBuffer): string {
  return crc32(buffer).toString(16).padStart(8, '0');
}

/** Example usage:
import { crc32, crc32Hex } from './checksum';
const buf = new TextEncoder().encode('hello').buffer;
console.log(crc32(buf)); // number
console.log(crc32Hex(buf)); // '3610a686' style hex
*/
