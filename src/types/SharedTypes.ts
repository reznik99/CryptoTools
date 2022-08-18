export interface Props {
    input: string,
    loading: boolean,
    setState: Function,
    path: string,
};

export interface CryptoSettings {
    algorithm: AlgorithmIdentifier | RsaHashedImportParams | EcKeyImportParams | HmacImportParams | AesKeyAlgorithm,
    keyUsages: Array<KeyUsage>
};