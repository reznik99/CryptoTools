
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';

import './App.css';

function App() {
    return (
        <div className="App" lg={6}>
            <Container fluid>
                <Row>
                    <Col lg={3} style={{ padding: 0 }}>
                        <Nav defaultActiveKey="AES" className="flex-column" style={{ backgroundColor: 'white', minHeight: '100vh' }} variant="pills">
                            <h3 className="title">Crypto Tools</h3>
                            <Nav.Item>Keys</Nav.Item>
                            <Nav.Link eventKey="AES">AES</Nav.Link>
                            <Nav.Link eventKey="RSA">RSA</Nav.Link>
                            <Nav.Link eventKey="ECDSA">ECDSA</Nav.Link>
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
                    <Col lg={9}>
                        <h4> Generate Key </h4>
                        <Form.Group className="mb-3">
                            <Form.Label>Keylength</Form.Label>
                            <Form.Control type="numeric" placeholder="256" />
                        </Form.Group>
                        <Button>Generate</Button>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default App;
