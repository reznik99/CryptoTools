
import React from 'react'

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';

import './App.css';

class App extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            action: 'AES-Gen',
            // Keygen
            keyLength: 256,
            curve: 'P-256',
            // Enc/Dec
            message: '',
            input: '',
            output: ''
        }
    }

    // Helper functions

    _arrayBufferToBase64 = (buffer) => {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    _str2ab = (str) => {
        const buf = new ArrayBuffer(str.length);
        const bufView = new Uint8Array(buf);
        for (let i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }

    _parsePem = (headerTag, pem) => {
        // fetch the part of the PEM string between header and footer
        const pemHeader = `-----BEGIN ${headerTag} KEY-----`;
        const pemFooter = `-----END ${headerTag} KEY-----`;
        const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
        // base64 decode the string to get the binary data
        const binaryDerString = window.atob(pemContents);
        // convert from a binary string to an ArrayBuffer
        return this._str2ab(binaryDerString);
    }

    _keypairToPem = async (keypair) => {
        const exportedPriv = await window.crypto.subtle.exportKey("pkcs8", keypair.privateKey)
        const exportedPrivAsBase64 = this._arrayBufferToBase64(new Uint8Array(exportedPriv))
        const pemPriv = `-----BEGIN PRIVATE KEY-----\n${exportedPrivAsBase64}\n-----END PRIVATE KEY-----`;

        const exportedPub = await window.crypto.subtle.exportKey("spki", keypair.publicKey)
        const exportedPubAsBase64 = this._arrayBufferToBase64(new Uint8Array(exportedPub))
        const pemPub = `-----BEGIN PUBLIC KEY-----\n${exportedPubAsBase64}\n-----END PUBLIC KEY-----`;

        return `${pemPriv}\n${pemPub}`
    }

    importRsaPub = async (pem) => {
        const binaryDer = this._parsePem('PUBLIC', pem)

        return await window.crypto.subtle.importKey(
            "spki",
            binaryDer,
            {
                name: "RSA-OAEP",
                hash: "SHA-256"
            },
            true,
            ["encrypt"]
        );
    }

    importRsaPriv = async (pem) => {
        const binaryDer = this._parsePem('PRIVATE', pem)

        return window.crypto.subtle.importKey(
            "pkcs8",
            binaryDer,
            {
                name: "RSA-OAEP",
                hash: "SHA-256",
            },
            true,
            ["decrypt"]
        );
    }

    generateAES = async () => {
        try {
            this.setState({ loading: true })
            const key = await window.crypto.subtle.generateKey(
                {
                    name: "AES-GCM",
                    length: this.state.keyLength
                },
                true,
                ["encrypt", "decrypt"]
            );

            const exported = await window.crypto.subtle.exportKey("raw", key)
            const exportedKeyBuffer = new Uint8Array(exported);

            this.setState({ output: this._arrayBufferToBase64(exportedKeyBuffer) })
        } catch (err) {
            console.error(err)
        } finally {
            this.setState({ loading: false })
        }
    }

    generateRSA = async () => {
        try {
            this.setState({ loading: true })
            const keypair = await window.crypto.subtle.generateKey(
                {
                    name: "RSA-OAEP",
                    modulusLength: this.state.keyLength,
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: "SHA-256"
                },
                true,
                ["encrypt", "decrypt"]
            );

            this.setState({ output: await this._keypairToPem(keypair) })
        } catch (err) {
            console.error(err)
        } finally {
            this.setState({ loading: false })
        }
    }

    generateECDSA = async () => {
        try {
            this.setState({ loading: true })
            const keypair = await window.crypto.subtle.generateKey(
                {
                    name: "ECDSA",
                    namedCurve: this.state.curve
                },
                true,
                ["sign", "verify"]
            );

            this.setState({ output: await this._keypairToPem(keypair) })
        } catch (err) {
            console.error(err)
        } finally {
            this.setState({ loading: false })
        }
    }

    encryptRSA = async () => {
        try {
            this.setState({ loading: true })

            const publicKey = await this.importRsaPub(this.state.input)
            if (publicKey) console.log('Imported Public key')
            else console.log('Failed to import Public key')

            const cipherText = await window.crypto.subtle.encrypt(
                {
                    name: "RSA-OAEP"
                },
                publicKey,
                this._str2ab(this.state.message)
            );

            this.setState({ output: this._arrayBufferToBase64(cipherText) })
        } catch (err) {
            console.error(err)
        } finally {
            this.setState({ loading: false })
        }
    }

    decryptRSA = async () => {
        try {
            this.setState({ loading: true })

            const privateKey = await this.importRsaPriv(this.state.input)
            if (privateKey) console.log('Imported Private key')
            else console.log('Failed to import Private key')

            const plainText = await window.crypto.subtle.decrypt(
                {
                    name: "RSA-OAEP"
                },
                privateKey,
                this._str2ab(window.atob(this.state.message))
            );

            this.setState({ output: this._arrayBufferToBase64(plainText) })
        } catch (err) {
            console.error(err)
        } finally {
            this.setState({ loading: false })
        }
    }

    render = () => {
        return (
            <div className="App" lg={6} >
                <Container fluid>
                    <Row>
                        <Col lg={2} style={{ padding: 0 }}>
                            <Nav activeKey={this.state.action} onSelect={eventKey => this.setState({ action: eventKey })} className="flex-column"
                                style={{ backgroundColor: '#fff', height: '100vh', color: 'black', overflow: 'scroll' }} variant="pills">
                                <h3 className="title">Crypto Tools</h3>
                                <Nav.Item>Generation</Nav.Item>
                                <Nav.Link eventKey="AES-Gen">AES Key</Nav.Link>
                                <Nav.Link eventKey="RSA-Gen">RSA Keys</Nav.Link>
                                <Nav.Link eventKey="ECDSA-Gen">ECDSA Keys</Nav.Link>
                                <Nav.Link eventKey="CSR-Gen">CSR</Nav.Link>
                                <Nav.Link eventKey="Certificate-Gen">Certificate</Nav.Link>
                                <Nav.Item>Encryption/Decryption</Nav.Item>
                                <Nav.Link eventKey="AES-Enc">AES</Nav.Link>
                                <Nav.Link eventKey="RSA-Enc">RSA</Nav.Link>
                                <Nav.Item>Signing/Validation</Nav.Item>
                                <Nav.Link eventKey="RSA-Sig">RSA</Nav.Link>
                                <Nav.Link eventKey="ECDSA-Sig">ECDSA</Nav.Link>
                                <Nav.Item>Hashing</Nav.Item>
                                <Nav.Link eventKey="SHA-1">SHA-1</Nav.Link>
                                <Nav.Link eventKey="SHA-256">SHA-256</Nav.Link>
                                <Nav.Link eventKey="SHA-384">SHA-384</Nav.Link>
                                <Nav.Link eventKey="SHA-512">SHA-512</Nav.Link>
                                <Nav.Item>Encoding</Nav.Item>
                                <Nav.Link eventKey="Base64">Base64</Nav.Link>
                                <Nav.Link eventKey="Hex">Hex</Nav.Link>
                                <Nav.Link eventKey="Binary">Binary</Nav.Link>
                            </Nav>
                        </Col>
                        <Col lg={5}>
                            <Row style={{ height: '100vh' }} className="justify-content-md-center align-items-md-center">
                                <Col lg={8}>
                                    <h4> Generate Key </h4>

                                    {this.state.action === 'AES-Gen' &&
                                        <>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Keylength</Form.Label>
                                                <Form.Control type="numeric" placeholder="256" value={this.state.keyLength} onChange={(e) => this.setState({ keyLength: Number(e.target.value) })} />
                                            </Form.Group>
                                            <Button onClick={this.generateAES}>Generate AES Key</Button>
                                        </>
                                    }
                                    {this.state.action === 'RSA-Gen' &&
                                        <>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Keylength</Form.Label>
                                                <Form.Control type="numeric" placeholder="256" value={this.state.keyLength} onChange={(e) => this.setState({ keyLength: Number(e.target.value) })} />
                                            </Form.Group>
                                            <Button onClick={this.generateRSA}>Generate RSA Key</Button>
                                        </>
                                    }
                                    {this.state.action === 'ECDSA-Gen' &&
                                        <>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Curve</Form.Label>
                                                <Form.Select value={this.state.curve} onChange={(e) => this.setState({ curve: e.target.value })}>
                                                    <option value="P-256">P-256</option>
                                                    <option value="P-384">P-384</option>
                                                    <option value="P-521">P-521</option>
                                                </Form.Select>
                                            </Form.Group>
                                            <Button onClick={this.generateRSA}>Generate ECDSA Key</Button>
                                        </>
                                    }

                                    {this.state.action === 'RSA-Enc' &&
                                        <>
                                            <Form.Group className="mb-3">
                                                <Form.Label>PlainText / CipherText</Form.Label>
                                                <Form.Control type="text" placeholder="Hi Mom" value={this.state.plainText} onChange={(e) => this.setState({ plainText: e.target.value })} />
                                            </Form.Group>
                                            <ButtonGroup size="lg" className="mb-2">
                                                <Button onClick={this.decryptRSA}>Decrypt</Button>
                                                <Button onClick={this.encryptRSA}>Encrypt</Button>
                                            </ButtonGroup>

                                        </>
                                    }
                                </Col>
                            </Row>
                        </Col>
                        <Col lg={5}>
                            <Row style={{ height: '50%' }}>
                                <Form.Group >
                                    <Form.Label>Input</Form.Label>
                                    <Form.Control as="textarea" rows={12} placeholder="Input"
                                        value={this.state.input} onChange={e => this.setState({ input: e.target.value })} />
                                </Form.Group>
                            </Row>
                            <Row style={{ height: '50%' }}>
                                <Form.Group >
                                    <Form.Label>Output</Form.Label>
                                    <Form.Control as="textarea" rows={12} placeholder="Output" value={this.state.output} />
                                </Form.Group>
                            </Row>
                        </Col>
                    </Row>
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
                </Container>
            </div>
        );
    }
}

export default App;
