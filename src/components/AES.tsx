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

const keyUsages: Array<KeyUsage> = ["encrypt", "decrypt"];

const importAES = async (key: string, settings: CryptoSettings) => {
    const binaryDer = Buffer.from(key, 'base64')

    return window.crypto.subtle.importKey(
        "raw",
        binaryDer,
        settings.algorithm,
        true,
        settings.keyUsages
    );
}

const generateAES = async (props: Props, keyLength: number) => {
    try {
        props.setState({ loading: true })
        const key = await window.crypto.subtle.generateKey(
            {
                name: "AES-GCM",
                length: keyLength
            },
            true,
            ["encrypt", "decrypt"]
        );

        const exported = await window.crypto.subtle.exportKey("raw", key)
        const exportedKeyBuffer = new Uint8Array(exported);

        props.setState({ output: encoding.arrayBufferToBase64(exportedKeyBuffer), successMsg: `(AES-${keyLength}) Generated successfully` })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: err })
    } finally {
        props.setState({ loading: false })
    }
}

const encryptAES = async (props: Props, aesMode: string, message: string) => {
    try {
        props.setState({ loading: true })

        const settings: CryptoSettings = {
            algorithm: { name: aesMode },
            keyUsages
        }
        const key = await importAES(props.input, settings)
        const iv = window.crypto.getRandomValues(new Uint8Array(16));

        const cipherText = await window.crypto.subtle.encrypt(
            {
                name: aesMode,
                iv: iv
            },
            key,
            Buffer.from(message, 'ascii')
        );

        props.setState({
            output: `ciphertext: ${encoding.arrayBufferToBase64(cipherText)}\niv: ${encoding.arrayBufferToBase64(iv)}`,
            successMsg: `(AES-CBC) Encrypted successfully`
        })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: err })
    } finally {
        props.setState({ loading: false })
    }
}

const decryptAES = async (props: Props, aesMode: string, message: string, ivText: string) => {
    try {
        props.setState({ loading: true })

        const settings = {
            algorithm: { name: aesMode },
            keyUsages
        }
        const key = await importAES(props.input, settings)
        const iv = Buffer.from(ivText, 'base64');

        const plainText = await window.crypto.subtle.decrypt(
            {
                name: aesMode,
                iv: iv
            },
            key,
            Buffer.from(message, 'base64')
        );

        props.setState({ output: encoding.arrayBufferToString(plainText), successMsg: `(AES-CBC) Decrypted successfully` })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: err })
    } finally {
        props.setState({ loading: false })
    }
}


export default function AES(props: Props) {
    const [aesMode, setAESMode] = useState('AES-GCM')
    const [keyLength, setKeyLength] = useState(256)
    const [message, setMessage] = useState('')
    const [iv, setIV] = useState('')

    switch (props.path) {
        case '/AES-Gen':
            return <Row className="justify-content-center align-items-center">
                <Col lg={8} >
                    <h4> Generate Key </h4>
                    <Form.Group className="mb-3">
                        <Form.Label>Keylength</Form.Label>
                        <Form.Control type="numeric" placeholder="256" value={keyLength} onChange={(e) => setKeyLength(Number(e.target.value))} />
                    </Form.Group>
                    {!props.loading && <Button onClick={() => generateAES(props, keyLength)}>Generate AES Key</Button>}
                    {props.loading && <Button><Spinner animation="border" size="sm" /> Generating</Button>}
                </Col>
            </Row>
        case '/AES-Enc':
            return <Row className="justify-content-center align-items-center">
                <Col lg={8} >
                    <h4> Encrypt/Decrypt </h4>
                    <Form.Group className="mb-3">
                        <Form.Label>Algorithm</Form.Label>
                        <Form.Select value={aesMode} onChange={e => setAESMode(e.target.value)}>
                            <option value="AES-CBC">AES-CBC</option>
                            <option value="AES-GCM">AES-GCM</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>PlainText / CipherText</Form.Label>
                        <Form.Control type="text" placeholder="ASCII for encryption and base64 for decryption" value={message} onChange={(e) => setMessage(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>IV (required for decryption)</Form.Label>
                        <Form.Control type="text" placeholder="Base64 IV for decryption" value={iv} onChange={(e) => setIV(e.target.value)} />
                    </Form.Group>
                    {!props.loading &&
                        <ButtonGroup size="lg" className="mb-2">
                            <Button onClick={() => decryptAES(props, aesMode, message, iv)}>Decrypt</Button>
                            <Button onClick={() => encryptAES(props, aesMode, message)}>Encrypt</Button>
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
            return <></>
    }
}