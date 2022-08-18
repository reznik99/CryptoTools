
import React, { Component } from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import Alert from 'react-bootstrap/Alert';
import { Location, useLocation } from "react-router-dom";

import Sidebar from './components/Sidebar'
import AES from './components/AES';
import RSA from './components/RSA';
import ECDSA from './components/ECDSA';
import CSR from './components/CSR';
import SHA from './components/SHA';

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

    render = () => {
        return (
            <Container fluid className="App">
                <Row className="wrapper">
                    <Row>
                        <Col xs="auto" className="p-0">
                            <i className="bi bi-list px-3 py-2 open-menu-btn" onClick={() => this.setState({ menuOpen: !this.state.menuOpen })}/>
                            <Sidebar collapsed={!this.state.menuOpen} toggled={true} handleToggleSidebar={() => console.log("test")}/>
                        </Col>
                        <Col xs>
                            <Row className="justify-content-center align-items-center h-100">
                                <Col sm={12} className="content-container">

                                    {/* RSA Functions */}
                                    <RSA {...this.state} path={this.props.location.pathname} setState={(data: any) => this.setState({ ...data })} />

                                    {/* AES Functions */}
                                    <AES {...this.state} path={this.props.location?.pathname} setState={(data: any) => this.setState({ ...data })} />

                                    {/* ECDSA Functions */}
                                    <ECDSA {...this.state} path={this.props.location?.pathname} setState={(data: any) => this.setState({ ...data })} />

                                    {/* SHA Functions */}
                                    <SHA {...this.state} path={this.props.location?.pathname} setState={(data: any) => this.setState({ ...data })} />

                                    {/* CSR Functions */}
                                    <CSR {...this.state} path={this.props.location?.pathname} setState={(data: any) => this.setState({ ...data })} />

                                </Col>
                            </Row>
                        </Col>
                        <Col xs={5} className="output-container">
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

const withNavigation = (Component: any) => {
    return (props: any) => <Component {...props} location={useLocation()} />;
}

export default withNavigation(App);
