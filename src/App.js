
import React from 'react';

import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';

import RSA from './components/RSA';
import AES from './components/AES';
import ECDSA from './components/ECDSA';

class App extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            errorMsg: '',
            action: 'AES-Gen',
            // Keygen
            keyLength: 256,
            curve: 'P-256',
            // Enc/Dec
            message: '',
            iv: '',
            input: '',
            output: ''
        }
    }

    render = () => {
        return (
            <div className="App" lg={6} >
                <Container fluid>
                    <Row>
                        <Col lg={2} style={{ padding: 0 }}>
                            <Nav activeKey={this.state.action} onSelect={eventKey => this.setState({ action: eventKey })} className="flex-column nav" variant="pills">
                                <h3 className="title">Crypto Tools</h3>
                                <Nav.Item>Generation</Nav.Item>
                                <Nav.Link eventKey="AES-Gen">AES Key</Nav.Link>
                                <Nav.Link eventKey="RSA-Gen">RSA Keys</Nav.Link>
                                <Nav.Link eventKey="ECDSA-Gen">ECDSA Keys</Nav.Link>
                                <Nav.Link eventKey="CSR-Gen" disabled>CSR</Nav.Link>
                                <Nav.Link eventKey="Certificate-Gen" disabled>Certificate</Nav.Link>
                                <Nav.Item>Encryption/Decryption</Nav.Item>
                                <Nav.Link eventKey="AES-Enc">AES</Nav.Link>
                                <Nav.Link eventKey="RSA-Enc">RSA</Nav.Link>
                                <Nav.Item>Signing/Validation</Nav.Item>
                                <Nav.Link eventKey="RSA-Sig">RSA</Nav.Link>
                                <Nav.Link eventKey="ECDSA-Sig">ECDSA</Nav.Link>
                                <Nav.Item>Hashing</Nav.Item>
                                <Nav.Link eventKey="SHA-1" disabled>SHA-1</Nav.Link>
                                <Nav.Link eventKey="SHA-256" disabled>SHA-256</Nav.Link>
                                <Nav.Link eventKey="SHA-384" disabled>SHA-384</Nav.Link>
                                <Nav.Link eventKey="SHA-512" disabled>SHA-512</Nav.Link>
                                <Nav.Item>Encoding</Nav.Item>
                                <Nav.Link eventKey="Base64" disabled>Base64</Nav.Link>
                                <Nav.Link eventKey="Hex" disabled>Hex</Nav.Link>
                                <Nav.Link eventKey="Binary" disabled>Binary</Nav.Link>
                            </Nav>
                        </Col>
                        <Col lg={5}>
                            <Row style={{ height: '100vh' }} className="justify-content-md-center align-items-md-center">
                                <Col lg={8}>

                                    {/* RSA Functions */}
                                    <RSA {...this.state} setState={(data) => this.setState({ ...data })} />

                                    {/* AES Functions */}
                                    <AES {...this.state} setState={(data) => this.setState({ ...data })} />

                                    {/* ECDSA Functions */}
                                    <ECDSA {...this.state} setState={(data) => this.setState({ ...data })} />

                                </Col>
                            </Row>
                        </Col>
                        <Col lg={5}>
                            <Row style={{ height: '50%' }}>
                                <Form.Group >
                                    <Form.Label>Input</Form.Label>
                                    <Form.Control as="textarea" className="niceTextArea" placeholder="Input"
                                        value={this.state.input} onChange={e => this.setState({ input: e.target.value })} />
                                </Form.Group>
                            </Row>
                            <Row style={{ height: '50%' }}>
                                <Form.Group >
                                    <Form.Label>Output</Form.Label>
                                    <Form.Control as="textarea" className="niceTextArea" placeholder="Output"
                                        value={this.state.output} onChange={e => this.setState({ output: e.target.value })} />
                                </Form.Group>
                            </Row>
                        </Col>
                    </Row>

                    {/* Loader/Spinner for intensive processes */}
                    <Modal show={this.state.loading}>
                        <Modal.Header closeButton>
                            <Modal.Title></Modal.Title>
                        </Modal.Header>
                        <Modal.Body style={{ textAlign: 'center' }}>
                            <Spinner animation="border" role="status" >
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </Modal.Body>
                        <Modal.Footer></Modal.Footer>
                    </Modal>

                    {/* Alert */}
                    <ToastContainer position="top-end" className="p-3">
                        <Toast onClose={() => this.setState({ errorMsg: '' })} show={this.state.errorMsg} delay={3000} autohide bg="danger">
                            <Toast.Header>
                                <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
                                <strong className="me-auto">Error occoured</strong>
                                <small className="text-muted">just now</small>
                            </Toast.Header>
                            <Toast.Body variant="danger">{this.state.errorMsg.toString()}</Toast.Body>
                        </Toast>
                    </ToastContainer>
                </Container>
            </div>
        );
    }
}

export default App;
