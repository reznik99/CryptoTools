import React, { useState } from 'react';
import { Buffer } from 'buffer';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import * as encoding from '../lib/encoding';
import { Props, CryptoSettings } from '../types/SharedTypes';

const encSettings: CryptoSettings = {
    algorithm: {
        name: "RSA-OAEP",
        hash: "SHA-256",
    },
    keyUsages: ["encrypt"]
}
const decSettings: CryptoSettings = {
    algorithm: {
        name: "RSA-OAEP",
        hash: "SHA-256",
    },
    keyUsages: ["decrypt"]
}

const importRSAPub = async (pem: string, settings: CryptoSettings) => {
    const binaryDer = encoding.pemToBuffer('PUBLIC', pem)

    return await window.crypto.subtle.importKey(
        "spki",
        binaryDer,
        settings.algorithm,
        true,
        settings.keyUsages
    );
}

const importRSAPriv = async (pem: string, settings: CryptoSettings) => {
    const binaryDer = encoding.pemToBuffer('PRIVATE', pem)

    return window.crypto.subtle.importKey(
        "pkcs8",
        binaryDer,
        settings.algorithm,
        true,
        settings.keyUsages
    );
}

const generateRSA = async (props: Props, keyLength: number) => {
    try {
        props.setState({ loading: true })
        const keypair = await window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: keyLength,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256"
            },
            true,
            ["encrypt", "decrypt"]
        );

        props.setState({ output: await encoding.keypairToPem(keypair), successMsg: `(RSA-${keyLength}) Generated successfully` })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: err })
    } finally {
        props.setState({ loading: false })
    }
}

const encryptRSA = async (props: Props, message: string) => {
    try {
        props.setState({ loading: true })

        const publicKey = await importRSAPub(props.input, encSettings)

        const cipherText = await window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP"
            },
            publicKey,
            Buffer.from(message, 'ascii')
        );

        props.setState({ output: encoding.arrayBufferToBase64(cipherText), successMsg: `(RSA-OAEP) Encrypted successfully` })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: err })
    } finally {
        props.setState({ loading: false })
    }
}

const decryptRSA = async (props: Props, message: string) => {
    try {
        props.setState({ loading: true })

        const privateKey = await importRSAPriv(props.input, decSettings)

        const plainText = await window.crypto.subtle.decrypt(
            {
                name: "RSA-OAEP"
            },
            privateKey,
            Buffer.from(message, 'base64')
        );

        props.setState({ output: encoding.arrayBufferToString(plainText), successMsg: `(RSA-OAEP) Decrypted successfully` })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: err })
    } finally {
        props.setState({ loading: false })
    }
}

const signRSA = async (props: Props, rsaMode: string, hashAlgo: string, message: string) => {
    try {
        props.setState({ loading: true })

        const settings: CryptoSettings = {
            algorithm: {
                name: rsaMode,
                hash: hashAlgo,
            },
            keyUsages: ["sign"] as Array<KeyUsage>
        };

        const privateKey = await importRSAPriv(props.input, settings);

        const signature = await window.crypto.subtle.sign(
            {
                name: rsaMode,
                saltLength: 32,
            },
            privateKey,
            Buffer.from(message, 'ascii')
        );

        props.setState({ output: encoding.arrayBufferToBase64(signature), successMsg: `(${rsaMode}) Signed successfully` });
    } catch (err) {
        console.error(err);
        props.setState({ errorMsg: err });
    } finally {
        props.setState({ loading: false });
    }
}

const verifyRSA = async (props: Props, rsaMode: string, hashAlgo: string, message: string, signature: string) => {
    try {
        props.setState({ loading: true })

        const settings: CryptoSettings = {
            algorithm: {
                name: rsaMode,
                hash: hashAlgo,
            },
            keyUsages: ["verify"] as Array<KeyUsage>
        };

        const publicKey = await importRSAPub(props.input, settings);

        const valid = await window.crypto.subtle.verify(
            {
                name: rsaMode,
                saltLength: 32,
            },
            publicKey,
            Buffer.from(signature, 'base64'),
            Buffer.from(message, 'ascii')
        );
        if (valid) props.setState({ output: "Valid", successMsg: `${rsaMode}) Verified successfully` });
        else props.setState({ output: "Invalid", errorMsg: `${rsaMode}) Verification failed` });
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: err });
    } finally {
        props.setState({ loading: false });
    }
}

export default function RSA(props: Props) {
    const [rsaMode, setRSAMode] = useState('RSA-PSS')
    const [keyLength, setKeyLength] = useState(2048)
    const [hashAlgo, setHashAlgo] = useState('SHA-256')
    const [message, setMessage] = useState('')
    const [signature, setSignature] = useState('')

    switch (props.action) {
        case 'RSA-Gen':
            return <Row className="justify-content-center align-items-center">
                <Col lg={8} >
                    <h4> Generate Key </h4>
                    <Form.Group className="mb-3">
                        <Form.Label>Keylength</Form.Label>
                        <Form.Control type="numeric" placeholder="2048" value={keyLength} onChange={(e) => setKeyLength(Number(e.target.value))} />
                    </Form.Group>
                    {!props.loading && <Button onClick={() => generateRSA(props, keyLength)}>Generate RSA Key</Button>}
                    {props.loading && <Button><Spinner animation="border" size="sm" /> Generating</Button>}
                </Col>
            </Row>
        case 'RSA-Enc':
            return <Row className="justify-content-center align-items-center">
                <Col lg={8} >
                    <h4> Encrypt/Decrypt </h4>
                    <Form.Group className="mb-3">
                        <Form.Label>Algorithm</Form.Label>
                        <Form.Select disabled>
                            <option value="RSA-OAEP">RSA-OAEP</option>
                            <option value="AES-GCM">RSAES-PKCS1-v1_5</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>PlainText / CipherText</Form.Label>
                        <Form.Control type="text" placeholder="Hi Mom" value={message} onChange={(e) => setMessage(e.target.value)} />
                    </Form.Group>
                    {!props.loading &&
                        <ButtonGroup size="lg" className="mb-2">
                            <Button onClick={() => decryptRSA(props, message)}>Decrypt</Button>
                            <Button onClick={() => encryptRSA(props, message)}>Encrypt</Button>
                        </ButtonGroup>
                    }
                    {props.loading &&
                        <ButtonGroup size="lg" className="mb-2">
                            <Button><Spinner animation="border" size="sm" /> Decrypting</Button>
                            <Button><Spinner animation="border" size="sm" /> Encrypting</Button>
                        </ButtonGroup>
                    }
                </Col>
            </Row>
        case 'RSA-Sig':
            return <Row className="justify-content-center align-items-center">
                <Col lg={8} >
                    <h4> Sign/Validate </h4>
                    <Row>
                        <Col lg={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Algorithm</Form.Label>
                                <Form.Select value={rsaMode} onChange={e => setRSAMode(e.target.value)}>
                                    <option value="RSASSA-PKCS1-v1_5">RSASSA-PKCS1-v1_5</option>
                                    <option value="RSA-PSS">RSA-PSS</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col lg={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Hash Algorithm</Form.Label>
                                <Form.Select value={hashAlgo} onChange={e => setHashAlgo(e.target.value)}>
                                    <option value="SHA-1">SHA-1</option>
                                    <option value="SHA-256">SHA-256</option>
                                    <option value="SHA-384">SHA-384</option>
                                    <option value="SHA-512">SHA-512</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Form.Group className="mb-3">
                        <Form.Label>Message</Form.Label>
                        <Form.Control type="text" placeholder="Hi Mom" value={message} onChange={(e) => setMessage(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Signature (required for validation)</Form.Label>
                        <Form.Control type="text" placeholder="Base64 signature" value={signature} onChange={(e) => setSignature(e.target.value)} />
                    </Form.Group>
                    {!props.loading &&
                        <ButtonGroup size="lg" className="mb-2">
                            <Button onClick={() => verifyRSA(props, rsaMode, hashAlgo, message, signature)}>Validate</Button>
                            <Button onClick={() => signRSA(props, rsaMode, hashAlgo, message)}>Sign</Button>
                        </ButtonGroup>
                    }
                    {props.loading &&
                        <ButtonGroup size="lg" className="mb-2">
                            <Button><Spinner animation="border" size="sm" /> Decrypting</Button>
                            <Button><Spinner animation="border" size="sm" /> Encrypting</Button>
                        </ButtonGroup>
                    }
                </Col>
            </Row>
        default:
            return
    }
}