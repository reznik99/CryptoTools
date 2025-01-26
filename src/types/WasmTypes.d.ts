declare global {
  export interface Window {
    Go: any;
    ParseX509Certificate: (pem: string) => string
    SignX509Certificate: (pemCsr: string, pemKey: string, pemCert: string, selfSign: boolean) => string
    Md5Digest: (data: string) => string
  }
}

export { };
