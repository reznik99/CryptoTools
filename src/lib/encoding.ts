import { Buffer } from 'buffer';


// Convert SubtleCrypto Keypair to PEM
export const keypairToPEM = async (keypair: CryptoKeyPair) => {
    const exportedPriv = await window.crypto.subtle.exportKey("pkcs8", keypair.privateKey)
    const exportedPub = await window.crypto.subtle.exportKey("spki", keypair.publicKey)

    const exportedPrivAsBase64 = Buffer.from(exportedPriv).toString('base64')
    const exportedPubAsBase64 = Buffer.from(exportedPub).toString('base64')

    return [encodePEM(exportedPrivAsBase64, 'PRIVATE KEY'), encodePEM(exportedPubAsBase64, 'PUBLIC KEY')]
}

// Parse PEM data to Buffer for using with SubtleCrypto
export const decodePEM = (headerTag: string, pem: string) => {
    // fetch the part of the PEM string between header and footer
    const pemHeader = `-----BEGIN ${headerTag}-----`;
    const pemFooter = `-----END ${headerTag}-----`;
    const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
    // base64 decode the string to get the binary data
    return Buffer.from(pemContents, 'base64')
}

// Convert string to PEM armoured string
export const encodePEM = (value: string, pemHeader: string) => {
    const valueFormatted = value.replace(/(.{64})/g, "$1\n")
    return `-----BEGIN ${pemHeader}-----\n${valueFormatted.trimEnd()}\n-----END ${pemHeader}-----`
}

// Checks if string is ASCII
export function isASCII(str: string) {
    return /^[\x00-\x7F]*$/.test(str);
}

// Truncates a string to given length if it exceeds it
export function truncate(str: string, n: number, endStr: string = "") {
    return (str.length > n) ? str.slice(0, n - 1) + '...' + endStr : str;
};