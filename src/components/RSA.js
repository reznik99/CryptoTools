import React, { useState } from 'react';
import { Buffer } from 'buffer';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';

import * as encoding from '../lib/encoding';

const encSettings = {
    algorithm: {
        name: "RSA-OAEP",
        hash: "SHA-256",
    },
    keyUsages: ["encrypt"]
}
const decSettings = {
    algorithm: {
        name: "RSA-OAEP",
        hash: "SHA-256",
    },
    keyUsages: ["decrypt"]
}
const sigSettings = {
    algorithm: {
        name: "RSA-PSS",
        hash: "SHA-256",
    },
    keyUsages: ["sign"]
}
const verSettings = {
    algorithm: {
        name: "RSA-PSS",
        hash: "SHA-256",
    },
    keyUsages: ["verify"]
}

const importRSAPub = async (pem, settings) => {
    const binaryDer = encoding.pemToBuffer('PUBLIC', pem)

    return await window.crypto.subtle.importKey(
        "spki",
        binaryDer,
        settings.algorithm,
        true,
        settings.keyUsages
    );
}

const importRSAPriv = async (pem, settings) => {
    const binaryDer = encoding.pemToBuffer('PRIVATE', pem)

    return window.crypto.subtle.importKey(
        "pkcs8",
        binaryDer,
        settings.algorithm,
        true,
        settings.keyUsages
    );
}

const generateRSA = async (props, keyLength) => {
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

const encryptRSA = async (props, message) => {
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

const decryptRSA = async (props, message) => {
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

const signRSA = async (props, message) => {
    try {
        props.setState({ loading: true })

        const privateKey = await importRSAPriv(props.input, sigSettings)
        if (privateKey) console.log('Imported Private key')

        const signature = await window.crypto.subtle.sign(
            {
                name: "RSA-PSS",
                saltLength: 32,
            },
            privateKey,
            Buffer.from(message, 'ascii')
        );

        props.setState({ output: encoding.arrayBufferToBase64(signature), successMsg: `(RSA-PSS) Signed successfully` })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: err })
    } finally {
        props.setState({ loading: false })
    }
}

const verifyRSA = async (props, message, signature) => {
    try {
        props.setState({ loading: true })

        const publicKey = await importRSAPub(props.input, verSettings)
        if (publicKey) console.log('Imported Public key')

        const valid = await window.crypto.subtle.verify(
            {
                name: "RSA-PSS",
                saltLength: 32,
            },
            publicKey,
            Buffer.from(signature, 'base64'),
            Buffer.from(message, 'ascii')
        );
        if (valid) props.setState({ output: "Valid", successMsg: `(RSA-PSS) Verified successfully` })
        else props.setState({ output: "Invalid", errorMsg: `(RSA-PSS) Verification failed` })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: err })
    } finally {
        props.setState({ loading: false })
    }
}

export default function RSA(props) {
    const [keyLength, setKeyLength] = useState(2048)
    const [message, setMessage] = useState('')
    const [signature, setSignature] = useState('')

    switch (props.action) {
        case 'RSA-Gen':
            return <>
                <h4> Generate Key </h4>
                <Form.Group className="mb-3">
                    <Form.Label>Keylength</Form.Label>
                    <Form.Control type="numeric" placeholder="2048" value={keyLength} onChange={(e) => setKeyLength(Number(e.target.value))} />
                </Form.Group>
                {!props.loading && <Button onClick={() => generateRSA(props, keyLength)}>Generate RSA Key</Button>}
                {props.loading && <Button><Spinner animation="border" size="sm" /> Generating</Button>}
            </>
        case 'RSA-Enc':
            return <>
                <h4> Encrypt/Decrypt </h4>
                <Form.Group className="mb-3">
                    <Form.Label>Algorithm</Form.Label>
                    <Form.Select disabled>
                        <option value="RSA-OAEP">RSA-OAEP</option>
                        <option value="AES-GCM">AES-GCM</option>
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
            </>
        case 'RSA-Sig':
            return <>
                <h4> Sign/Validate </h4>
                <Form.Group className="mb-3">
                    <Form.Label>Algorithm</Form.Label>
                    <Form.Select disabled>
                        <option value="RSA-PSS">RSA-PSS</option>
                        <option value="RSA-PKCS1v15">RSA-PKCS1v15</option>
                    </Form.Select>
                </Form.Group>
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
                        <Button onClick={() => verifyRSA(props, message, signature)}>Validate</Button>
                        <Button onClick={() => signRSA(props, message)}>Sign</Button>
                    </ButtonGroup>
                }
                {props.loading &&
                    <ButtonGroup size="lg" className="mb-2">
                        <Button><Spinner animation="border" size="sm" /> Decrypting</Button>
                        <Button><Spinner animation="border" size="sm" /> Encrypting</Button>
                    </ButtonGroup>
                }
            </>
        default:
            return
    }
}