import React from 'react';
import { Buffer } from 'buffer';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';

import * as encoding from '../lib/encoding';

const encSettings = {
    algorithm: {
        name: "AES-CBC",
    },
    keyUsages: ["encrypt", "decrypt"]
}

const importAES = async (key, settings) => {
    const binaryDer = Buffer.from(key, 'base64')

    return window.crypto.subtle.importKey(
        "raw",
        binaryDer,
        settings.algorithm,
        true,
        settings.keyUsages
    );
}

const generateAES = async (props) => {
    try {
        props.setState({ loading: true })
        const key = await window.crypto.subtle.generateKey(
            {
                name: "AES-GCM",
                length: props.keyLength
            },
            true,
            ["encrypt", "decrypt"]
        );

        const exported = await window.crypto.subtle.exportKey("raw", key)
        const exportedKeyBuffer = new Uint8Array(exported);

        props.setState({ output: encoding.arrayBufferToBase64(exportedKeyBuffer) })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: err })
    } finally {
        props.setState({ loading: false })
    }
}

const encryptAES = async (props) => {
    try {
        props.setState({ loading: true })

        const key = await importAES(props.input, encSettings)
        const iv = window.crypto.getRandomValues(new Uint8Array(16));

        const cipherText = await window.crypto.subtle.encrypt(
            {
                name: "AES-CBC",
                iv: iv
            },
            key,
            Buffer.from(props.message, 'ascii')
        );

        props.setState({ output: `ciphertext: ${encoding.arrayBufferToBase64(cipherText)}\niv: ${encoding.arrayBufferToBase64(iv)}` })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: err })
    } finally {
        props.setState({ loading: false })
    }
}

const decryptAES = async (props) => {
    try {
        props.setState({ loading: true })

        const key = await importAES(props.input, encSettings)
        const iv = Buffer.from(props.iv, 'base64');

        const plainText = await window.crypto.subtle.decrypt(
            {
                name: "AES-CBC",
                iv: iv
            },
            key,
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


export default function AES(props) {
    switch (props.action) {
        case 'AES-Gen':
            return <>
                <h4> Generate Key </h4>
                <Form.Group className="mb-3">
                    <Form.Label>Keylength</Form.Label>
                    <Form.Control type="numeric" placeholder="256" value={props.keyLength} onChange={(e) => props.setState({ keyLength: Number(e.target.value) })} />
                </Form.Group>
                <Button onClick={() => generateAES(props)}>Generate AES Key</Button>
            </>
        case 'AES-Enc':
            return <>
                <h4> Encrypt/Decrypt </h4>
                <Form.Group className="mb-3">
                    <Form.Label>Algorithm</Form.Label>
                    <Form.Select disabled>
                        <option value="AES-CBC">AES-CBC</option>
                        <option value="AES-GCM">AES-GCM</option>
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>IV (required for decryption)</Form.Label>
                    <Form.Control type="text" placeholder="Base64 IV for decryption" value={props.iv} onChange={(e) => props.setState({ iv: e.target.value })} />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>PlainText / CipherText</Form.Label>
                    <Form.Control type="text" placeholder="ASCII for encryption and base64 for decryption" value={props.message} onChange={(e) => props.setState({ message: e.target.value })} />
                </Form.Group>
                <ButtonGroup size="lg" className="mb-2">
                    <Button onClick={() => decryptAES(props)}>Decrypt</Button>
                    <Button onClick={() => encryptAES(props)}>Encrypt</Button>
                </ButtonGroup>

            </>
        default:
            return
    }
}