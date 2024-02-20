import React, { useState } from 'react';
import * as pkijs from 'pkijs';
import * as asn1js from 'asn1js';
import { Button, CircularProgress, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';

import { MultiInput, RowContent } from 'components/MultiInput'
import { Props } from 'types/SharedTypes';
import * as encoding from 'lib/encoding';

const DefaultSAN: RowContent = { type: 'DNSName', value: '' }

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
    const [extensions, setExtensions] = useState([DefaultSAN])

    return <Stack spacing={2}
        direction="column"
        justifyContent="center"
        alignItems="center"
        sx={{ mx: '250px', minHeight: '50vh' }}>
        <Typography variant='h4'> Key Details </Typography>

        <Stack direction="row" spacing={2} width='100%'>
            <FormControl fullWidth>
                <InputLabel id='algorithm-label'>Algorithm</InputLabel>
                <Select labelId='algorithm-label'
                    label='Algorithm'
                    value={algorithm}
                    onChange={e => setAlgorithm(e.target.value)}>
                    <MenuItem value="RSASSA-PKCS1-V1_5">RSASSA-PKCS1-V1_5</MenuItem>
                    <MenuItem value="RSA-PSS">RSA-PSS</MenuItem>
                    <MenuItem value="ECDSA">ECDSA</MenuItem>
                </Select>
            </FormControl>

            <FormControl fullWidth>
                <InputLabel id='hash-algorithm-label'>Hash Algorithm</InputLabel>
                <Select labelId='hash-algorithm-label'
                    label='Hash Algorithm'
                    value={hash}
                    onChange={e => setHash(e.target.value)}>
                    <MenuItem value="SHA-1">SHA-1</MenuItem>
                    <MenuItem value="SHA-256">SHA-256</MenuItem>
                    <MenuItem value="SHA-384">SHA-384</MenuItem>
                    <MenuItem value="SHA-512">SHA-512</MenuItem>
                </Select>
            </FormControl>
        </Stack>

        <Stack direction="row" spacing={2} width='100%'>
            <FormControl fullWidth>
                <InputLabel id='curve-label'>Curve (ECDSA Only)</InputLabel>
                <Select labelId='curve-label'
                    label='Curve (ECDSA Only)'
                    value={curve}
                    onChange={e => setCurve(e.target.value)} disabled={algorithm !== 'ECDSA'}>
                    <MenuItem value="P-256">P-256</MenuItem>
                    <MenuItem value="P-384">P-384</MenuItem>
                    <MenuItem value="P-521">P-521</MenuItem>
                </Select>
            </FormControl>

            <FormControl fullWidth>
                <TextField label="Key Length (RSA Only)"
                    variant="outlined"
                    placeholder="2048"
                    value={keyLength}
                    onChange={(e) => setKeyLength(Number(e.target.value))} />
            </FormControl>
        </Stack>

        <Typography variant='h4'> Subject Details </Typography>
        <FormControl fullWidth>
            <TextField label="Common Name"
                variant="outlined"
                placeholder="My New Certificate"
                value={commonName}
                onChange={(e) => setCommonName(e.target.value)} />
        </FormControl>

        <Stack direction="row" spacing={2} width='100%'>
            <FormControl fullWidth>
                <TextField label="Organisation"
                    variant="outlined"
                    placeholder="Evil Corp"
                    value={organisation}
                    onChange={(e) => setOrganisation(e.target.value)} />
            </FormControl>
            <FormControl fullWidth>
                <TextField label="Organisational Unit"
                    variant="outlined"
                    placeholder="EC Finance Dept"
                    value={organisationalUnit}
                    onChange={(e) => setOrganisationalUnit(e.target.value)} />
            </FormControl>
        </Stack>

        <Stack direction="row" spacing={2} width='100%'>
            <FormControl fullWidth>
                <TextField label="Locality"
                    variant="outlined"
                    placeholder="Chicago"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)} />
            </FormControl>
            <FormControl fullWidth>
                <TextField label="Country"
                    variant="outlined"
                    placeholder="USA"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)} />
            </FormControl>
        </Stack>

        <Typography variant='h4'> Extensions </Typography>
        <MultiInput Rows={extensions}
            AddRow={() => setExtensions(old => [...old, DefaultSAN])}
            DeleteRow={(idx: number) => setExtensions(old => old.filter((_, i) => i !== idx))}
            onChange={(idx: number, newValue: RowContent) => setExtensions(old => old.map((existingVal: RowContent, i: number) => i === idx ? newValue : existingVal))}
        />

        <Button hidden={!props.loading} variant='contained' disabled>
            <CircularProgress size={18} sx={{ mx: 1 }} /> Generating
        </Button>
        <Button hidden={props.loading} variant='contained'
            onClick={() => generateCSR(props, algorithm, curve, hash, commonName, organisation, organisationalUnit, locality, country)}>
            Generate CSR
        </Button>
    </Stack>
}