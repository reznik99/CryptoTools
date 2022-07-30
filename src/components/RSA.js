import React from 'react';
import { Buffer } from 'buffer';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';

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

const generateRSA = async (props) => {
    try {
        props.setState({ loading: true })
        const keypair = await window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: props.keyLength,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256"
            },
            true,
            ["encrypt", "decrypt"]
        );

        props.setState({ output: await encoding.keypairToPem(keypair) })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: err })
    } finally {
        props.setState({ loading: false })
    }
}

const encryptRSA = async (props) => {
    try {
        props.setState({ loading: true })

        const publicKey = await importRSAPub(props.input, encSettings)

        const cipherText = await window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP"
            },
            publicKey,
            Buffer.from(props.message, 'ascii')
        );

        props.setState({ output: encoding.arrayBufferToBase64(cipherText) })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: err })
    } finally {
        props.setState({ loading: false })
    }
}

const decryptRSA = async (props) => {
    try {
        props.setState({ loading: true })

        const privateKey = await importRSAPriv(props.input, decSettings)

        const plainText = await window.crypto.subtle.decrypt(
            {
                name: "RSA-OAEP"
            },
            privateKey,
            Buffer.from(props.message, 'base64')
        );

        props.setState({ output: encoding.arrayBufferToString(plainText) })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: err })
    } finally {
        props.setState({ loading: false })
    }
}

const signRSA = async (props) => {
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
            Buffer.from(props.message, 'ascii')
        );

        props.setState({ output: encoding.arrayBufferToBase64(signature) })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: err })
    } finally {
        props.setState({ loading: false })
    }
}

const verifyRSA = async (props) => {
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
            Buffer.from(props.signature, 'base64'),
            Buffer.from(props.message, 'ascii')
        );

        props.setState({ output: valid ? "Valid" : "Invalid" })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: err })
    } finally {
        props.setState({ loading: false })
    }
}

export default function RSA(props) {
    switch (props.action) {
        case 'RSA-Gen':
            return <>
                <h4> Generate Key </h4>
                <Form.Group className="mb-3">
                    <Form.Label>Keylength</Form.Label>
                    <Form.Control type="numeric" placeholder="256" value={props.keyLength} onChange={(e) => props.setState({ keyLength: Number(e.target.value) })} />
                </Form.Group>
                <Button onClick={() => generateRSA(props)}>Generate RSA Key</Button>
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
                    <Form.Control type="text" placeholder="Hi Mom" value={props.message} onChange={(e) => props.setState({ message: e.target.value })} />
                </Form.Group>
                <ButtonGroup size="lg" className="mb-2">
                    <Button onClick={() => decryptRSA(props)}>Decrypt</Button>
                    <Button onClick={() => encryptRSA(props)}>Encrypt</Button>
                </ButtonGroup>
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
                    <Form.Control type="text" placeholder="Hi Mom" value={props.message} onChange={(e) => props.setState({ message: e.target.value })} />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Signature (required for validation)</Form.Label>
                    <Form.Control type="text" placeholder="Base64 signature" value={props.signature} onChange={(e) => props.setState({ signature: e.target.value })} />
                </Form.Group>
                <ButtonGroup size="lg" className="mb-2">
                    <Button onClick={() => verifyRSA(props)}>Validate</Button>
                    <Button onClick={() => signRSA(props)}>Sign</Button>
                </ButtonGroup>
            </>
        default:
            return
    }
}