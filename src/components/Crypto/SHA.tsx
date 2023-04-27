import React, { useState } from 'react';
import { Buffer } from 'buffer';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import * as encoding from 'lib/encoding';
import { Props } from 'types/SharedTypes';

const digest = async (props: Props, message: string, algorithm: string) => {
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

export default function AES(props: Props) {
    const [algorithm, setAlgorithm] = useState('SHA-256')
    const [message, setMessage] = useState('')

    return <Row className="justify-content-center align-items-center">
        <Col lg={8} >
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
        </Col>
    </Row>
}