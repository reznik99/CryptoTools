import React, { useState } from 'react';
import { Buffer } from 'buffer';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';

import * as encoding from '../lib/encoding';

const encSettings = {
    algorithm: {
        name: "AES-CBC",
    },
    keyUsages: ["encrypt", "decrypt"]
}

const digest = async (props, message, algorithm) => {
    try {
        props.setState({ loading: true })

        const hash = await crypto.subtle.digest(algorithm, Buffer.from(message, 'ascii'));

        props.setState({ output: encoding.arrayBufferToBase64(hash), successMsg: `(${algorithm}) Hashed successfully` })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: err })
    } finally {
        props.setState({ loading: false })
    }
}


export default function AES(props) {
    const [algorithm, setAlgorithm] = useState('SHA-256')
    const [message, setMessage] = useState('')

    switch (props.action) {
        case 'SHA':
            return <>
                <h4> Hash </h4>
                <Form.Group className="mb-3">
                    <Form.Label>Algorithm</Form.Label>
                    <Form.Select value={algorithm} onChange={e => setAlgorithm(e.target.value)}>
                        <option value="SHA-1">SHA-1</option>
                        <option value="SHA-256">SHA-256</option>
                        <option value="SHA-384">SHA-384</option>
                        <option value="SHA-512">SHA-512</option>
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Message</Form.Label>
                    <Form.Control type="text" placeholder="ASCII message to hash" value={message} onChange={(e) => setMessage(e.target.value)} />
                </Form.Group>
                {!props.loading && <Button onClick={() => digest(props, message, algorithm)}>Digest</Button>}
                {props.loading && <Button><Spinner animation="border" size="sm" /> Hashing</Button>}
            </>
        default:
            return
    }
}