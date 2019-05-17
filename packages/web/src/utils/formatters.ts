const ADDRESS_LENGTH = 42;
const ADDRESS_LENGTH_NOPREFIX = 40;

export function addressToLength(address: string, prefixLen: number, suffixLen: number): string {
    if (!address) {
        return;
    }
    let output: string = '0x';
    let startPos: number;
    let startPos2: number;
    if (address.startsWith('0x')) {
        startPos = 2;
        startPos2 = ADDRESS_LENGTH - suffixLen;
    } else {
        startPos = 0;
        startPos2 = ADDRESS_LENGTH_NOPREFIX - suffixLen;
    }
    output += address.slice(startPos, startPos + prefixLen) + '...' + address.slice(startPos2, startPos2 + suffixLen);
    return output;
}
