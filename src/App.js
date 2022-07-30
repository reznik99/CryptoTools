
import React from 'react';

import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import Alert from 'react-bootstrap/Alert';

import RSA from './components/RSA';
import AES from './components/AES';
import ECDSA from './components/ECDSA';

class App extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            action: 'AES-Gen',
            loading: false,
            errorMsg: '',
            successMsg: '',
            input: '',
            output: ''
        }
    }

    render = () => {
        return (
            <Container fluid className="App vh-100">
                <Row className="wrapper">
                    <Col className="no-pad nav-container">
                        <Nav activeKey={this.state.action} onSelect={eventKey => this.setState({ action: eventKey })} className="flex-column nav h-100" variant="pills">
                            <h3 className="title">Crypto Tools</h3>
                            <Nav.Item><i class="bi bi-key" /> Generation</Nav.Item>
                            <Nav.Link eventKey="AES-Gen">AES Key</Nav.Link>
                            <Nav.Link eventKey="RSA-Gen">RSA Keys</Nav.Link>
                            <Nav.Link eventKey="ECDSA-Gen">ECDSA Keys</Nav.Link>
                            <Nav.Link eventKey="CSR-Gen" disabled>CSR</Nav.Link>
                            <Nav.Link eventKey="Certificate-Gen" disabled>Certificate</Nav.Link>
                            <Nav.Item><i class="bi bi-lock" /> Encryption/Decryption</Nav.Item>
                            <Nav.Link eventKey="AES-Enc">AES</Nav.Link>
                            <Nav.Link eventKey="RSA-Enc">RSA</Nav.Link>
                            <Nav.Item><i class="bi bi-pen" /> Signing/Validation</Nav.Item>
                            <Nav.Link eventKey="RSA-Sig">RSA</Nav.Link>
                            <Nav.Link eventKey="ECDSA-Sig">ECDSA</Nav.Link>
                            <Nav.Item><i class="bi bi-hash" /> Hashing</Nav.Item>
                            <Nav.Link eventKey="SHA">SHA</Nav.Link>
                            <Nav.Link eventKey="MD5" disabled>MD5</Nav.Link>
                            <Nav.Item><i class="bi bi-wrench" /> Encoding</Nav.Item>
                            <Nav.Link eventKey="Base64" disabled>Base64</Nav.Link>
                            <Nav.Link eventKey="Hex" disabled>Hex</Nav.Link>
                            <Nav.Link eventKey="Binary" disabled>Binary</Nav.Link>
                        </Nav>
                    </Col>
                    <Col>
                        <Row className="justify-content-md-center align-items-md-center h-100">
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
                    <Col>
                        <Row className=" h-50">
                            <Form.Group >
                                <Form.Label>Input</Form.Label>
                                <Form.Control as="textarea" className="niceTextArea" placeholder="Input"
                                    value={this.state.input} onChange={e => this.setState({ input: e.target.value })} />
                            </Form.Group>
                        </Row>
                        <Row className=" h-50">
                            <Form.Group >
                                <Form.Label>Output</Form.Label>
                                <Form.Control as="textarea" className="niceTextArea" placeholder="Output"
                                    value={this.state.output} onChange={e => this.setState({ output: e.target.value })} />
                            </Form.Group>
                        </Row>
                    </Col>
                    <Alert variant='info' className="footer">
                        Made with <i class="bi bi-heart-fill" style={{ color: "#ff0000" }} /> and <i class="bi bi-cup-hot-fill" />. <br />
                        Open source on <Alert.Link href="https://github.com/reznik99/CryptoTools" target="_blank">github.com</Alert.Link>
                    </Alert>
                </Row>

                {/* Alerts */}
                <ToastContainer position="top-end" className="p-3">
                    {/* Success Toast */}
                    <Toast onClose={() => this.setState({ successMsg: '' })} show={this.state.successMsg} delay={4000} autohide bg="success">
                        <Toast.Header>
                            <strong className="me-auto">Success</strong>
                            <small className="text-muted">just now</small>
                        </Toast.Header>
                        <Toast.Body variant="danger">{this.state.successMsg || ""}</Toast.Body>
                    </Toast>
                    {/* Error Toast */}
                    <Toast onClose={() => this.setState({ errorMsg: '' })} show={this.state.errorMsg} delay={5000} autohide bg="danger">
                        <Toast.Header>
                            <strong className="me-auto">Error occoured</strong>
                            <small className="text-muted">just now</small>
                        </Toast.Header>
                        <Toast.Body variant="danger">{this.state.errorMsg?.toString() || ""}</Toast.Body>
                    </Toast>
                </ToastContainer>
            </Container>
        );
    }
}

export default App;
