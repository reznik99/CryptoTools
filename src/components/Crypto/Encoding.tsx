import React, { useState } from 'react';
import { Buffer } from 'buffer';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import { Props } from 'types/SharedTypes';

const encode = (data: string, inEncoding: BufferEncoding, outEncoding: BufferEncoding) => {
    return Buffer.from(data, inEncoding).toString(outEncoding)
}

export default function Encoding(props: Props) {
    const [inEncoding, setInEncoding] = useState('base64' as BufferEncoding)
    const [outEncoding, setOutEncoding] = useState('hex' as BufferEncoding)

    switch (props.path) {
        case '/encoding':
            return <Row className="justify-content-center align-items-center">
                <Col lg={10}>
                    <h4 className="mb-3"> Encode/Decode </h4>
                    <Row>
                        <Col lg={6} className="mb-3">
                            <Form.Group>
                                <Form.Label>From</Form.Label>
                                <Form.Select value={inEncoding} onChange={e => setInEncoding(e.target.value as any)}>
                                    <option value="ascii">ASCII</option>
                                    <option value="base64">Base64</option>
                                    <option value="hex">Hex</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col lg={6} className="mb-3">
                            <Form.Group>
                                <Form.Label>To</Form.Label>
                                <Form.Select value={outEncoding} onChange={e => setOutEncoding(e.target.value as any)}>
                                    <option value="ascii">ASCII</option>
                                    <option value="base64">Base64</option>
                                    <option value="hex">Hex</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Button onClick={() => props.setState({ output: encode(props.input, inEncoding, outEncoding) })}>Convert</Button>
                </Col>
            </Row>
        default:
            return <></>
    }
}