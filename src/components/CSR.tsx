import React, { useState } from 'react';
import * as pkijs from 'pkijs';
import * as asn1js from 'asn1js';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import * as encoding from '../lib/encoding';
import { Props } from '../types/SharedTypes';

const generateCSR = async (props: Props, algorithm: string, curve: string, hash: string, CN: string, O: string, OU: string, L: string, C: string) => {
    try {
        props.setState({ loading: true })

        const csr = new pkijs.CertificationRequest()

        // Get Algorithm parameters and Generate appropriate keypair
        const algoParams = pkijs.getAlgorithmParameters(algorithm, 'generateKey')
        if ((algoParams.algorithm as any)?.hash) (algoParams.algorithm as any).hash = hash
        if ((algoParams.algorithm as any)?.namedCurve) (algoParams.algorithm as any).namedCurve = curve
        const keypair = await window.crypto.subtle.generateKey(algoParams.algorithm as AlgorithmIdentifier, true, algoParams.usages) as CryptoKeyPair

        // Write Public Key into CSR
        await csr.subjectPublicKeyInfo.importKey(keypair.publicKey)

        // Write CSR Subject values if present
        if (CN.trim()) {
            csr.subject.typesAndValues.push(new pkijs.AttributeTypeAndValue({
                type: "2.5.4.3",
                value: new asn1js.Utf8String({ value: CN.trim() })
            }));
        }
        if (O.trim()) {
            csr.subject.typesAndValues.push(new pkijs.AttributeTypeAndValue({
                type: "2.5.4.10",
                value: new asn1js.Utf8String({ value: O.trim() })
            }));
        }
        if (OU.trim()) {
            csr.subject.typesAndValues.push(new pkijs.AttributeTypeAndValue({
                type: "2.5.4.11",
                value: new asn1js.Utf8String({ value: OU.trim() })
            }));
        }
        if (L.trim()) {
            csr.subject.typesAndValues.push(new pkijs.AttributeTypeAndValue({
                type: "2.5.4.7",
                value: new asn1js.Utf8String({ value: L.trim() })
            }));
        }
        if (C.trim()) {
            csr.subject.typesAndValues.push(new pkijs.AttributeTypeAndValue({
                type: "2.5.4.6",
                value: new asn1js.PrintableString({ value: C.trim() })
            }));
        }

        // Sign the CSR with the appropriate Private Key
        await csr.sign(keypair.privateKey, hash);

        // Export as PEM
        const csrBER = csr.toSchema().toBER(false);
        const csrPEM = encoding.arrayBufferToBase64(csrBER);

        props.setState({ output: csrPEM, successMsg: `(${algorithm}-${hash}) CSR Generated successfully` });
    } catch (err) {
        console.error(err);
        props.setState({ errorMsg: err });
    } finally {
        props.setState({ loading: false });
    }
}


export default function CSR(props: Props) {
    const [algorithm, setAlgorithm] = useState('ECDSA')
    const [hash, setHash] = useState('SHA-256')
    const [keyLength, setKeyLength] = useState(2048)
    const [curve, setCurve] = useState('P-256')
    const [commonName, setCommonName] = useState('')
    const [organisation, setOrganisation] = useState('')
    const [organisationalUnit, setOrganisationalUnit] = useState('')
    const [locality, setLocality] = useState('')
    const [country, setCountry] = useState('')

    switch (props.action) {
        case 'CSR-Gen':
            return <>
                <h4> Key Details </h4>
                <Row>
                    <Col lg={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Algorithm</Form.Label>
                            <Form.Select value={algorithm} onChange={e => setAlgorithm(e.target.value)}>
                                <option value="RSASSA-PKCS1-V1_5">RSASSA-PKCS1-V1_5</option>
                                <option value="RSA-PSS">RSA-PSS</option>
                                <option value="ECDSA">ECDSA</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col lg={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Cipher</Form.Label>
                            <Form.Select value={hash} onChange={e => setHash(e.target.value)}>
                                <option value="SHA-1">SHA-1</option>
                                <option value="SHA-256">SHA-256</option>
                                <option value="SHA-384">SHA-384</option>
                                <option value="SHA-512">SHA-512</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col lg={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Curve (ECDSA Only)</Form.Label>
                            <Form.Select value={curve} onChange={e => setCurve(e.target.value)} disabled={algorithm !== 'ECDSA'}>
                                <option value="P-256">P-256</option>
                                <option value="P-384">P-384</option>
                                <option value="P-521">P-521</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col lg={6}><Form.Group className="mb-3">
                        <Form.Group className="mb-3">
                            <Form.Label>Key Length (RSA Only)</Form.Label>
                            <Form.Control type="number" value={keyLength} onChange={(e) => setKeyLength(Number(e.target.value))} />
                        </Form.Group>
                    </Form.Group></Col>
                </Row>

                <h4> CSR Details </h4>
                <Form.Group className="mb-3">
                    <Form.Label>Common Name</Form.Label>
                    <Form.Control type="text" placeholder="My New Certificate" value={commonName} onChange={(e) => setCommonName(e.target.value)} />
                </Form.Group>
                <Row>
                    <Col lg={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Organisation</Form.Label>
                            <Form.Control type="text" placeholder="Evil Corp" value={organisation} onChange={(e) => setOrganisation(e.target.value)} />
                        </Form.Group>
                    </Col>
                    <Col lg={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Organisational Unit</Form.Label>
                            <Form.Control type="text" placeholder="EC Finance Dept" value={organisationalUnit} onChange={(e) => setOrganisationalUnit(e.target.value)} />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col lg={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Locality</Form.Label>
                            <Form.Control type="text" placeholder="Chicago" value={locality} onChange={(e) => setLocality(e.target.value)} />
                        </Form.Group>
                    </Col>
                    <Col lg={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Country</Form.Label>
                            <Form.Control type="text" placeholder="USA" value={country} onChange={(e) => setCountry(e.target.value)} />
                        </Form.Group>
                    </Col>
                </Row>

                <div className="mt-2 text-center">
                    {!props.loading && <Button size='lg' onClick={() => generateCSR(props, algorithm, curve, hash, commonName, organisation, organisationalUnit, locality, country)}>Generate CSR</Button>}
                    {props.loading && <Button size='lg'><Spinner animation="border" size="sm" /> Generating...</Button>}
                </div>
            </>
        default:
            return <></>
    }
}