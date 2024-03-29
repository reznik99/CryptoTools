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