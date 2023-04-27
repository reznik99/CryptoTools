
import React from 'react';
import { Location, useLocation, Routes, Route } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import Alert from 'react-bootstrap/Alert';

import Sidebar from 'components/Sidebar'
import AES from 'components/Crypto/AES';
import RSA from 'components/Crypto/RSA';
import ECDSA from 'components/Crypto/ECDSA';
import CSR from 'components/Crypto/CSR';
import SHA from 'components/Crypto/SHA';
import Encoding from 'components/Crypto/Encoding';

interface IState {
    loading: boolean,
    menuOpen: boolean,
    errorMsg: string,
    successMsg: string,
    input: string,
    output: string
}
interface IProps {
    location: Location
}

class App extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props)
        this.state = {
            loading: false,
            menuOpen: true,
            errorMsg: '',
            successMsg: '',
            input: '',
            output: ''
        };
    }

    MenuBtn = () => {
        return this.state.menuOpen
            ? <i className="bi bi-x px-3 py-2 toggle-menu-btn" onClick={() => this.setState({ menuOpen: false })} />
            : <i className="bi bi-list px-3 py-2 toggle-menu-btn" onClick={() => this.setState({ menuOpen: true })} />
    }

    OutputContainer = () => {
        return <Col lg={4} xs={5} className="output-container">
            <Row className="h-50 mv-1">
                <Form.Group >
                    <Form.Label>Input {this.state.input?.length ? `(${this.state.input?.length} characters)` : null}</Form.Label>
                    <Form.Control as="textarea" className="nice-text-area" placeholder="Input for action i.e Public/Private Key"
                        value={this.state.input} onChange={e => this.setState({ input: e.target.value })} />
                </Form.Group>
            </Row>
            <Row className="h-50 mv-1">
                <Form.Group >
                    <Form.Label>Output {this.state.output?.length ? `(${this.state.output?.length} characters)` : null}</Form.Label>
                    <Form.Control as="textarea" className="nice-text-area" placeholder="Output of action i.e CSR or Key"
                        value={this.state.output} onChange={e => this.setState({ output: e.target.value })} />
                </Form.Group>
            </Row>
        </Col>
    }

    render = () => {
        return (
            <Container fluid className="App">
                <Row className="wrapper">
                    <Row>
                        <Col xs="auto" className="p-0">
                            <Sidebar collapsed={!this.state.menuOpen} toggled={true} path={this.props.location?.pathname} />
                        </Col>

                        <Col xs>
                            <Row style={{ position: 'relative' }}>
                                <this.MenuBtn />
                                <Col sm={12} className="content-container px-5">
                                    <Routes>
                                        {/* RSA Functions */}
                                        <Route path="/RSA/:action" element={<RSA {...this.state} setState={this.setState.bind(this)} />} />
                                        {/* AES Functions */}
                                        <Route path="/AES/:action" element={<AES {...this.state} setState={this.setState.bind(this)} />} />
                                        {/* ECDSA Functions */}
                                        <Route path="/ECDSA/:action" element={<ECDSA {...this.state} setState={this.setState.bind(this)} />} />
                                        {/* CSR Functions */}
                                        <Route path="/CSR" element={<CSR {...this.state} setState={this.setState.bind(this)} />} />
                                        {/* SHA Functions */}
                                        <Route path="/SHA" element={<SHA {...this.state} setState={this.setState.bind(this)} />} />
                                        {/* Encoding Functions */}
                                        <Route path="/Encoding" element={<Encoding {...this.state} setState={this.setState.bind(this)} />} />
                                    </Routes>
                                </Col>
                            </Row>
                        </Col>

                        <this.OutputContainer />

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
const withNavigation = (Component: any) => {
    return (props: any) => <Component {...props} location={useLocation()} />;
}

export default withNavigation(App);
