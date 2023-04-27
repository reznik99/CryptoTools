import React from 'react';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Props } from 'types/SharedTypes';

function Output(props: Props) {
    return (
        <Col lg={4} xs={5} className="output-container">
            <Row className="h-50 mv-1">
                <Form.Group>
                    <Form.Label>Input {props.input?.length ? `(${props.input?.length} characters)` : null}</Form.Label>
                    <Form.Control as="textarea"
                        className="nice-text-area"
                        placeholder="Input for action i.e Public/Private Key"
                        value={props.input}
                        onChange={e => props.setState({ input: e.target.value })} />
                </Form.Group>
            </Row>
            <Row className="h-50 mv-1">
                <Form.Group>
                    <Form.Label>Output {props.output?.length ? `(${props.output?.length} characters)` : null}</Form.Label>
                    <Form.Control as="textarea"
                        className="nice-text-area"
                        placeholder="Output of action i.e CSR or Key"
                        value={props.output}
                        onChange={e => props.setState({ output: e.target.value })} />
                </Form.Group>
            </Row>
        </Col>
    )
}

export default Output