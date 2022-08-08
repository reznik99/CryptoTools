
import React from 'react';

import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';

import AES from './components/AES';
import RSA from './components/RSA';
import ECDSA from './components/ECDSA';
import CSR from './components/CSR';
import SHA from './components/SHA';

interface IState {
    action: string,
    loading: boolean,
    menuOpen: boolean,
    errorMsg: string,
    successMsg: string,
    input: string,
    output: string
}
interface IProps { }

class App extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props)
        this.state = {
            action: 'AES-Gen',
            loading: false,
            menuOpen: true,
            errorMsg: '',
            successMsg: '',
            input: '',
            output: ''
        };
    }

    render = () => {
        return (
            <Container fluid className="App">
                <Row className="wrapper">
                    <Row>
                        <Col xs="auto" className={`no-pad nav-container ${this.state.menuOpen ? 'nav-container-open' : ''}`}>
                            <Button className="nav-slider" variant="primary" onClick={() => this.setState({ menuOpen: !this.state.menuOpen })}>
                                {this.state.menuOpen
                                    ? <><i className="bi bi-arrow-left" /> Menu</>
                                    : <>Menu <i className="bi bi-arrow-right" /></>
                                }
                            </Button>
                            <Nav className="flex-column nav" variant="pills" activeKey={this.state.action} onSelect={eventKey => this.setState({ action: eventKey ?? 'AES-Gen' })}>
                                <h3 className="title">Crypto Tools</h3>
                                <Nav.Item><i className="bi bi-key" /> Generation</Nav.Item>
                                <Nav.Link eventKey="AES-Gen">AES Key</Nav.Link>
                                <Nav.Link eventKey="RSA-Gen">RSA Keys</Nav.Link>
                                <Nav.Link eventKey="ECDSA-Gen">ECDSA Keys</Nav.Link>
                                <Nav.Link eventKey="CSR-Gen">CSR <Badge bg="success">New</Badge></Nav.Link>
                                <Nav.Link eventKey="Certificate-Gen" disabled>Certificate</Nav.Link>
                                <Nav.Item><i className="bi bi-lock" /> Encryption/Decryption</Nav.Item>
                                <Nav.Link eventKey="AES-Enc">AES</Nav.Link>
                                <Nav.Link eventKey="RSA-Enc">RSA</Nav.Link>
                                <Nav.Item><i className="bi bi-pen" /> Signing/Validation</Nav.Item>
                                <Nav.Link eventKey="RSA-Sig">RSA</Nav.Link>
                                <Nav.Link eventKey="ECDSA-Sig">ECDSA <Badge bg="success">New</Badge></Nav.Link>
                                <Nav.Item><i className="bi bi-hash" /> Hashing</Nav.Item>
                                <Nav.Link eventKey="SHA">SHA <Badge bg="success">New</Badge></Nav.Link>
                                <Nav.Link eventKey="MD5" disabled>MD5</Nav.Link>
                                <Nav.Item><i className="bi bi-wrench" /> Encoding</Nav.Item>
                                <Nav.Link eventKey="Base64" disabled>Base64</Nav.Link>
                                <Nav.Link eventKey="Hex" disabled>Hex</Nav.Link>
                                <Nav.Link eventKey="Binary" disabled>Binary</Nav.Link>
                            </Nav>
                        </Col>
                        <Col lg={8} md xs={12}>
                            <Row className="justify-content-center align-items-center h-100">
                                <Col lg={10} sm={12} className="content-container">

                                    {/* RSA Functions */}
                                    <RSA {...this.state} setState={(data: any) => this.setState({ ...data })} />

                                    {/* AES Functions */}
                                    <AES {...this.state} setState={(data: any) => this.setState({ ...data })} />

                                    {/* ECDSA Functions */}
                                    <ECDSA {...this.state} setState={(data: any) => this.setState({ ...data })} />

                                    {/* SHA Functions */}
                                    <SHA {...this.state} setState={(data: any) => this.setState({ ...data })} />

                                    {/* CSR Functions */}
                                    <CSR {...this.state} setState={(data: any) => this.setState({ ...data })} />

                                </Col>
                            </Row>
                        </Col>
                        <Col lg md xs={12} className="output-container">
                            <Row className="h-50 mv-1">
                                <Form.Group >
                                    <Form.Label>Input {this.state.input?.length ? `(${this.state.input?.length} characters)` : null}</Form.Label>
                                    <Form.Control as="textarea" className="nice-text-area" placeholder="Input"
                                        value={this.state.input} onChange={e => this.setState({ input: e.target.value })} />
                                </Form.Group>
                            </Row>
                            <Row className="h-50 mv-1">
                                <Form.Group >
                                    <Form.Label>Output {this.state.output?.length ? `(${this.state.output?.length} characters)` : null}</Form.Label>
                                    <Form.Control as="textarea" className="nice-text-area" placeholder="Output"
                                        value={this.state.output} onChange={e => this.setState({ output: e.target.value })} />
                                </Form.Group>
                            </Row>
                        </Col>
                    </Row>
                    <Alert variant='info' className="footer">
                        Made with <i className="bi bi-heart-fill" style={{ color: "#ff0000" }} /> and <i className="bi bi-cup-hot-fill" />. <br />
                        Open source on <Alert.Link href="https://github.com/reznik99/CryptoTools" {...{ target: "_blank" }}>github.com</Alert.Link>
                    </Alert>
                </Row>

                {/* Alerts */}
                <ToastContainer position="top-end" className="p-3">
                    {/* Success Toast */}
                    <Toast onClose={() => this.setState({ successMsg: '' })} show={Boolean(this.state.successMsg)} delay={4000} autohide bg="success">
                        <Toast.Header>
                            <strong className="me-auto">Success</strong>
                            <small className="text-muted">just now</small>
                        </Toast.Header>
                        <Toast.Body>{this.state.successMsg || ""}</Toast.Body>
                    </Toast>
                    {/* Error Toast */}
                    <Toast onClose={() => this.setState({ errorMsg: '' })} show={Boolean(this.state.errorMsg)} delay={5000} autohide bg="danger">
                        <Toast.Header>
                            <strong className="me-auto">Error occoured</strong>
                            <small className="text-muted">just now</small>
                        </Toast.Header>
                        <Toast.Body>{this.state.errorMsg?.toString() || ""}</Toast.Body>
                    </Toast>
                </ToastContainer>
            </Container>
        );
    }
}

export default App;
