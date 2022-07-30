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
    }
}