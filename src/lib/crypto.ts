import { ImportOpts } from "types/SharedTypes";

export const hkdfImportOpts: ImportOpts = {
    format: "raw",
    algorithm: { name: "HKDF" },
    exportable: false,
    usages: ["deriveBits"]
}

export const pbkdf2ImportOpts: ImportOpts = {
    format: "raw",
    algorithm: { name: "PBKDF2" },
    exportable: false,
    usages: ["deriveBits"]
}

export const ecdhPubImportOpts: ImportOpts = {
    format: "spki",
    algorithm: { name: "ECDH" },
    exportable: true,
    usages: []
}

export const ecdhPrivImportOpts: ImportOpts = {
    format: "pkcs8",
    algorithm: { name: "ECDH" },
    exportable: true,
    usages: ["deriveKey"]
}

export async function importKey(key: Buffer, opts: ImportOpts) {
    return crypto.subtle.importKey(
        opts.format,
        key,
        opts.algorithm,
        opts.exportable,
        opts.usages
    );
}