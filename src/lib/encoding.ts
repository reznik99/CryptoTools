
import { Buffer } from 'buffer';

// Encoding/Decoding helper functions

// Convert ArrayBuffer to base64 string 
export function arrayBufferToBase64(buffer: ArrayBuffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// Convert ArrayBuffer to string 
export const arrayBufferToString = (buffer: ArrayBuffer) => {
    return new TextDecoder().decode(buffer)
};

// Convert PEM data to Buffer for using with SubtleCrypto
export const pemToBuffer = (headerTag: string, pem: string) => {
    // fetch the part of the PEM string between header and footer
    const pemHeader = `-----BEGIN ${headerTag} KEY-----`;
    const pemFooter = `-----END ${headerTag} KEY-----`;
    const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
    // base64 decode the string to get the binary data
    return Buffer.from(pemContents, 'base64')
}

// Convert SubtleCrypto Keypair to PEM
export const keypairToPem = async (keypair: CryptoKeyPair) => {
    const exportedPriv = await window.crypto.subtle.exportKey("pkcs8", keypair.privateKey)
    const exportedPrivAsBase64 = arrayBufferToBase64(new Uint8Array(exportedPriv))
    const pemPriv = `-----BEGIN PRIVATE KEY-----\n${exportedPrivAsBase64}\n-----END PRIVATE KEY-----`;

    const exportedPub = await window.crypto.subtle.exportKey("spki", keypair.publicKey)
    const exportedPubAsBase64 = arrayBufferToBase64(new Uint8Array(exportedPub))
    const pemPub = `-----BEGIN PUBLIC KEY-----\n${exportedPubAsBase64}\n-----END PUBLIC KEY-----`;

    return `${pemPriv}\n${pemPub}`
}