<div id="top"></div>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

# CryptoTools


### `Cryptographic tools for your browser in a Single-Page app`

This website [crypto.francescogorini.com](https://crypto.francescogorini.com) is a cryptographic playground to **play** with, **test** and **learn** about **cryptography**. <br />
It runs all cryptographic operations in the browser utilising [SubtleCrypto API](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto), [PKIJS](https://github.com/PeculiarVentures/PKI.js) and [ASN1JS](https://github.com/lapo-luchini/asn1js).

### This project uses:
- [React](https://github.com/facebook/react)
- [Typescript](https://github.com/microsoft/TypeScript)
- [Material UI](https://mui.com/)
- [PKI.js](https://github.com/PeculiarVentures/PKI.js)
- [ASN1.js](https://github.com/PeculiarVentures/ASN1.js)

<!-- ROADMAP -->
## Roadmap

### Generation
- [x] __AES__ Key Generation.
- [x] __RSA__ Key Generation.
- [x] __ECDSA__ Key Generation with NIST __P-256__ __P-384__ and __P-521__ curve support.
- [x] __PKCS10/CSR__ Generation with custom __Subjects__ and with __ECDSA__, __RSA-PSS__ and __RSASSA-PKCS1-v1_5__ signatures.
- [x] __PKCS10/CSR__ Generation with custom __Subject Alternative Names__.
- [ ] __x509 Certificate__ Generation/Signing with custom key/cert.
### Encrypt/Decrypt
- [x] __AES-CBC__ Encrypt/Decrypt.
- [x] __AES-GCM__ Encrypt/Decrypt.
- [x] __RSA-OAEP__ Encrypt/Decrypt.
- [ ] __AES-GCM__ with additional authenticated data __AEAD__.
- [ ] __File__ encryption support.
### Sign/Verify
- [x] __RSASSA-PKCS1-v1_5__ Sign/Validate.
- [x] __RSA-PSS__ Sign/Validate.
- [x] __ECDSA__ Sign/Verify with NIST __P-256__ __P-384__ and __P-521__ curve support.
- [ ] __HMAC__ support.
- [ ] __File__ signing support.
### Hashing
- [x] __SHA-1__, __SHA-256__, __SHA-384__ and __SHA-512__ support.
- [ ] __MD5__ support.
- [ ] __File__ hashing support.
### Conversion
- [x] __Base64__ support.
- [x] __Hex__ support.
- [x] __ASCII__ support.
- [ ] __File__ support.
- [ ] __PKCS7__ support.

See the [open issues](https://github.com/reznik99/CryptoTools/issues) for a full list of proposed features (and known issues).
<br>
<br>

<!-- CONTACT -->
## Contact

Francesco Gorini - goras.francesco@gmail.com - https://francescogorini.com

Project Link: [https://github.com/reznik99/CryptoTools](https://github.com/reznik99/CryptoTools)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/reznik99/cryptotools.svg?style=for-the-badge
[contributors-url]: https://github.com/reznik99/cryptotools/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/reznik99/cryptotools.svg?style=for-the-badge
[forks-url]: https://github.com/reznik99/cryptotools/network/members
[stars-shield]: https://img.shields.io/github/stars/reznik99/cryptotools.svg?style=for-the-badge
[stars-url]: https://github.com/reznik99/cryptotools/stargazers
[issues-shield]: https://img.shields.io/github/issues/reznik99/cryptotools?style=for-the-badge
[issues-url]: https://github.com/reznik99/cryptotools/issues
[license-shield]: https://img.shields.io/github/license/reznik99/cryptotools?style=for-the-badge
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/francesco-gorini-b334861a6/
[screenshot]: res/read-me-banner.jpg