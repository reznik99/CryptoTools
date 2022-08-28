import React from 'react';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

interface IProps {
    Rows: Array<RowContent>,
    onChange: (idx: number, newValue: RowContent) => void,
    AddRow: () => void,
    DeleteRow: (index: number) => void
}

interface RowContent {
    value: string,
    type: string,
}

function MultiInput(props: IProps) {
    
    return (
        <>
            { props.Rows.map( (row, idx) => (
                <Row key={idx}>
                    <Col>
                        <Form.Group className="mb-1 d-flex">
                            <Col lg md={6} sm={12} className="mx-1">
                                <Form.Control type="text" placeholder="Extension Value" value={row.value} onChange={(e) => props.onChange(idx, {type: row.type, value: e.target.value})}/>
                            </Col>
                            <Col md sm={12} className="mx-1">
                                <Form.Select placeholder="Extension Type" value={row.type} onChange={(e) => props.onChange(idx, {type: e.target.value, value: row.value})}>
                                    <option value="DNSName">DNS Name</option>
                                    <option value="IPAddress">IP Address</option>
                                    <option value="EmailAddress">Email Address</option>
                                    <option value="DirectoryName">Directory Name</option>
                                    <option value="OtherName">Other Name</option>
                                </Form.Select>
                            </Col>

                            <Col lg="auto" md={12} className="mx-1">
                                <Button variant="danger" onClick={() => props.DeleteRow(idx)} disabled={props.Rows.length <= 1}>
                                    <i className="bi bi-x"/>
                                </Button>
                                <Button variant="success" onClick={() => props.AddRow()}>
                                    <i className="bi bi-plus"/>
                                </Button>
                            </Col>
                        </Form.Group>
                    </Col>
                </Row>
            ))}
        </>
    )
}


export {
    RowContent,
    MultiInput
}