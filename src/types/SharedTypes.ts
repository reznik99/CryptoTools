export interface Props {
    input: string;
    output?: string;
    loading: boolean;
    setState: Function;
};

export interface CryptoSettings {
    algorithm: AlgorithmIdentifier | RsaHashedImportParams | EcKeyImportParams | HmacImportParams | AesKeyAlgorithm;
    keyUsages: Array<KeyUsage>;
};

export interface ImportOpts {
    format: "raw" | "pkcs8" | "spki",
    algorithm: {
        name: string
    },
    exportable: boolean,
    usages: Array<KeyUsage>
}