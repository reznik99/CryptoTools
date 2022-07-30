import React from 'react';
import { Buffer } from 'buffer';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';

import * as encoding from '../lib/encoding';

const sigSettings = {
    algorithm: {
        name: "ECDSA",
    },
    keyUsages: ["sign"]
}
const verSettings = {
    algorithm: {
        name: "ECDSA",
    },
    keyUsages: ["verify"]
}

const importECDSAPub = async (pem, settings) => {
    const binaryDer = encoding.pemToBuffer('PUBLIC', pem)

    return await window.crypto.subtle.importKey(
        "spki",
        binaryDer,
        settings.algorithm,
        true,
        settings.keyUsages
    );
}

const importECDSAPriv = async (pem, settings) => {
    const binaryDer = encoding.pemToBuffer('PRIVATE', pem)

    return window.crypto.subtle.importKey(
        "pkcs8",
        binaryDer,
        settings.algorithm,
        true,
        settings.keyUsages
    );
}

const generateECDSA = async (props) => {
    try {
        props.setState({ loading: true })
        const keypair = await window.crypto.subtle.generateKey(
            {
                name: "ECDSA",
                namedCurve: props.curve
            },
            true,
            ["sign", "verify"]
        );

        props.setState({ output: await encoding.keypairToPem(keypair) })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: err })
    } finally {
        props.setState({ loading: false })
    }
}

const signECDSA = async (props) => {
    try {
        props.setState({ loading: true })

        const privateKey = await importECDSAPriv(props.input, sigSettings)
        if (privateKey) console.log('Imported Private key')

        const signature = await window.crypto.subtle.sign(
            {
                name: "ECDSA",
                hash: { name: "SHA-384" },
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

const verifyECDSA = async (props) => {
    try {
        props.setState({ loading: true })

        const publicKey = await importECDSAPub(props.input, verSettings)
        if (publicKey) console.log('Imported Public key')

        const valid = await window.crypto.subtle.verify(
            {
                name: "ECDSA",
                hash: { name: "SHA-384" },
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

export default function AES(props) {
    switch (props.action) {
        case 'ECDSA-Gen':
            return <>
                <h4> Generate Key </h4>
                <Form.Group className="mb-3">
                    <Form.Label>Curve</Form.Label>
                    <Form.Select value={props.curve} onChange={(e) => props.setState({ curve: e.target.value })}>
                        <option value="P-256">P-256</option>
                        <option value="P-384">P-384</option>
                        <option value="P-521">P-521</option>
                    </Form.Select>
                </Form.Group>
                <Button onClick={() => generateECDSA(props)}>Generate ECDSA Key</Button>
            </>
        case 'ECDSA-Sig':
            return <>
                <h4> Generate Key </h4>
                <Form.Group className="mb-3">
                    <Form.Label>Algorithm</Form.Label>
                    <Form.Select disabled>
                        <option value="ECDSA">ECDSA</option>
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
                    <Button onClick={() => verifyECDSA(props)} > Validate</Button>
                    <Button onClick={() => signECDSA(props)}>Sign</Button>
                </ButtonGroup>
            </>
        default:
            return
    }
}