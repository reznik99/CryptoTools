import React, { useState } from 'react';
import { Buffer } from 'buffer';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import * as encoding from '../lib/encoding';
import { Props, CryptoSettings } from '../types/SharedTypes';


const sigSettings: CryptoSettings = {
    algorithm: {
        name: "ECDSA",
    },
    keyUsages: ["sign"]
}
const verSettings: CryptoSettings = {
    algorithm: {
        name: "ECDSA",
    },
    keyUsages: ["verify"]
}

const importECDSAPub = async (pem: string, settings: CryptoSettings) => {
    const binaryDer = encoding.pemToBuffer('PUBLIC', pem)

    return await window.crypto.subtle.importKey(
        "spki",
        binaryDer,
        settings.algorithm,
        true,
        settings.keyUsages
    );
}

const importECDSAPriv = async (pem: string, settings: CryptoSettings) => {
    const binaryDer = encoding.pemToBuffer('PRIVATE', pem)

    return window.crypto.subtle.importKey(
        "pkcs8",
        binaryDer,
        settings.algorithm,
        true,
        settings.keyUsages
    );
}

const generateECDSA = async (props: Props, curve: string) => {
    try {
        props.setState({ loading: true })
        const keypair = await window.crypto.subtle.generateKey(
            {
                name: "ECDSA",
                namedCurve: curve
            },
            true,
            ["sign", "verify"]
        );

        props.setState({ output: await encoding.keypairToPem(keypair), successMsg: `(ECDSA-${curve}) Generated successfully` })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: err })
    } finally {
        props.setState({ loading: false })
    }
}

const signECDSA = async (props: Props, hashAlgo: string, message: string) => {
    try {
        props.setState({ loading: true })

        const privateKey = await importECDSAPriv(props.input, sigSettings)

        const signature = await window.crypto.subtle.sign(
            {
                name: "ECDSA",
                hash: { name: hashAlgo },
            },
            privateKey,
            Buffer.from(message, 'ascii')
        );

        props.setState({ output: encoding.arrayBufferToBase64(signature), successMsg: `(ECDSA) Signed successfully` })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: err })
    } finally {
        props.setState({ loading: false })
    }
}

const verifyECDSA = async (props: Props, hashAlgo: string, message: string, signature: string) => {
    try {
        props.setState({ loading: true })

        const publicKey = await importECDSAPub(props.input, verSettings)

        const valid = await window.crypto.subtle.verify(
            {
                name: "ECDSA",
                hash: { name: hashAlgo },
            },
            publicKey,
            Buffer.from(signature, 'base64'),
            Buffer.from(message, 'ascii')
        );

        if (valid) props.setState({ output: "Valid", successMsg: `(ECDSA) Verified successfully` })
        else props.setState({ output: "Invalid", errorMsg: `(ECDSA) Verification failed` })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: err })
    } finally {
        props.setState({ loading: false })
    }
}

export default function AES(props: Props) {
    const [curve, setCurve] = useState('P-256')
    const [hashAlgo, setHashAlgo] = useState('SHA-256')
    const [message, setMessage] = useState('')
    const [signature, setSignature] = useState('')

    switch (props.action) {
        case 'ECDSA-Gen':
            return <Row className="justify-content-center align-items-center">
                <Col lg={8} >
                    <h4> Generate Key </h4>
                    <Form.Group className="mb-3">
                        <Form.Label>Curve</Form.Label>
                        <Form.Select value={curve} onChange={(e) => setCurve(e.target.value)}>
                            <option value="P-256">P-256</option>
                            <option value="P-384">P-384</option>
                            <option value="P-521">P-521</option>
                        </Form.Select>
                    </Form.Group>
                    {!props.loading && <Button onClick={() => generateECDSA(props, curve)}>Generate ECDSA Key</Button>}
                    {props.loading && <Button><Spinner animation="border" size="sm" /> Generating</Button>}
                </Col>
            </Row>
        case 'ECDSA-Sig':
            return <Row className="justify-content-center align-items-center">
                <Col lg={8} >
                    <h4> Sign/Validate </h4>
                    <Row>
                        <Col lg={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Algorithm</Form.Label>
                                <Form.Select disabled>
                                    <option value="ECDSA">ECDSA</option>
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
                            <Button onClick={() => verifyECDSA(props, hashAlgo, message, signature)} > Validate</Button>
                            <Button onClick={() => signECDSA(props, hashAlgo, message)}>Sign</Button>
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