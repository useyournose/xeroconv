import { crc32Hex } from "./helper/crc32";

export function crc32(input: string | ArrayBuffer): string {
    const buffer = (() => {
        if (typeof input  == 'string') {
            const enc = new TextEncoder()
            return enc.encode(input).buffer
        } else {
            return input
        }
    })()
    return crc32Hex(buffer)
}


