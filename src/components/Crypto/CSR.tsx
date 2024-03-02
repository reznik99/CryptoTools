import React, { useState } from 'react';
import { Button, CircularProgress, Divider, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { Check, CloudUpload, Create, Key } from '@mui/icons-material';
import { Buffer } from 'buffer';
import * as pkijs from 'pkijs';

import { MultiInput, RowContent } from 'components/MultiInput'
import { CryptoSettings, Props } from 'types/SharedTypes';
import { createC, createCN, createSANExtension, createL, createO, createOU, createSKIExtension, oidExtensionsRequest } from 'lib/PKCS10';
import { encodePEM } from 'lib/encoding';
import { KeyUploadModal } from 'components/KeyUploadModal';
import { importRSAPriv, importRSAPub } from './RSA';
import { importECDSAPriv, importECDSAPub } from './ECDSA';

type keyDetails = {
    algorithm: string;
    hash: string;
    keyLength: number;
    curve: string;
}

type subject = {
    commonName: string;
    organisation: string;
    organisationalUnit: string;
    locality: string;
    country: string;
}

const defaultSAN = { type: 'DNSName', value: '' }

const generateCSRKeypair = async (keyDetails: keyDetails) => {
    // Get Algorithm parameters and generate appropriate keypair
    const algoParams = pkijs.getAlgorithmParameters(keyDetails.algorithm, 'generateKey')
    if ('hash' in algoParams.algorithm) {
        (algoParams.algorithm as any).hash = keyDetails.hash
    }
    if ('modulusLength' in algoParams.algorithm) {
        (algoParams.algorithm as any).modulusLength = keyDetails.keyLength
    }
    if ('namedCurve' in algoParams.algorithm) {
        (algoParams.algorithm as any).namedCurve = keyDetails.curve
    }

    const keypair = await window.crypto.subtle.generateKey(
        algoParams.algorithm as AlgorithmIdentifier,
        true,
        algoParams.usages
    ) as CryptoKeyPair

    return keypair
}

const importCSRKeypair = async (keyDetails: keyDetails, privPem: string, pubPem: string) => {
    let privateKey: CryptoKey;
    let publicKey: CryptoKey;

    try {
        switch (keyDetails.algorithm) {
            case 'RSASSA-PKCS1-V1_5':
            case 'RSA-PSS':
                const rsaSettings: CryptoSettings = {
                    algorithm: {
                        name: keyDetails.algorithm,
                        hash: keyDetails.hash,
                    },
                    keyUsages: []
                };
                privateKey = await importRSAPriv(privPem, { ...rsaSettings, keyUsages: ["sign"] })
                publicKey = await importRSAPub(pubPem, { ...rsaSettings, keyUsages: ["verify"] })
                break;
            case 'ECDSA':
                const ecdsaSettings: CryptoSettings = {
                    algorithm: {
                        name: keyDetails.algorithm,
                    },
                    keyUsages: []
                };
                privateKey = await importECDSAPriv(privPem, { ...ecdsaSettings, keyUsages: ["sign"] })
                publicKey = await importECDSAPub(pubPem, { ...ecdsaSettings, keyUsages: ["verify"] })
                break;
            default:
                throw new Error('Unrecognized algorithm selected: ' + keyDetails.algorithm)
        }
    } catch (err: any) {
        throw new Error(`Failed to import user keys: ${err?.message || err}. Check key formats and selected algorithm match`)
    }
    const output: CryptoKeyPair = { privateKey, publicKey }
    return output
}

const generateCSR = async (props: Props, keyDetails: keyDetails, subject: subject, extensions: RowContent[], privateKey: string, publicKey: string, doGenerate: boolean) => {
    const { algorithm, hash, keyLength, curve } = keyDetails
    const { commonName, organisation, organisationalUnit, locality, country } = subject

    if (!doGenerate) {
        if (!privateKey.trim()) {
            props.setState({ errorMsg: 'Private Key not supplied. Please supply private key or select "Generate Keypair"' })
            return
        }
        if (!publicKey.trim()) {
            props.setState({ errorMsg: 'Public Key not supplied. Please supply public key or select "Generate Keypair"' })
            return
        }
    }
    props.setState({ loading: true })
    try {
        const csr = new pkijs.CertificationRequest()

        let keypair: CryptoKeyPair;
        if (doGenerate) {
            keypair = await generateCSRKeypair(keyDetails)
            console.log("Generated keypair", algorithm)
        } else {
            keypair = await importCSRKeypair(keyDetails, privateKey, publicKey)
            console.log("Imported keypair", algorithm)
        }

        // Write Public Key into CSR
        await csr.subjectPublicKeyInfo.importKey(keypair.publicKey)

        // Write CSR Subject values if present
        if (commonName.trim()) {
            csr.subject.typesAndValues.push(createCN(commonName.trim()));
        }
        if (organisation.trim()) {
            csr.subject.typesAndValues.push(createO(organisation.trim()));
        }
        if (organisationalUnit.trim()) {
            csr.subject.typesAndValues.push(createOU(organisationalUnit.trim()));
        }
        if (locality.trim()) {
            csr.subject.typesAndValues.push(createL(locality.trim()));
        }
        if (country.trim()) {
            csr.subject.typesAndValues.push(createC(country.trim()));
        }


        // Write CSR Subject Key Identifier
        const ext = new pkijs.Extensions({
            extensions: [await createSKIExtension(keypair.publicKey)]
        })

        // Write CSR SANs if present
        if (extensions?.length) {
            const san = createSANExtension(extensions)
            if (san) {
                ext.extensions.push(san)
            }
        }

        csr.attributes = [
            new pkijs.Attribute({
                type: oidExtensionsRequest,
                values: [ext.toSchema()]
            })
        ]

        // Sign the CSR with the appropriate Private Key
        await csr.sign(keypair.privateKey, hash);

        // Export as PEM
        const csrBER = csr.toSchema().toBER(false);
        const csrPEM = Buffer.from(csrBER).toString('base64');
        const algoString = `${algorithm} with ${hash} (${algorithm === 'ECDSA' ? curve : keyLength + '-bit'})`

        props.setState({ output: encodePEM(csrPEM, 'CERTIFICATE REQUEST'), successMsg: `CSR Generated successfully: ${algoString}` });
    } catch (err: any) {
        console.error(err);
        props.setState({ errorMsg: `Failed to generate CSR: ${err?.message || err}`, output: '' })
    } finally {
        props.setState({ loading: false });
    }
}

export default function CSR(props: Props) {
    const [keyDetails, setKeyDetails] = useState<keyDetails>({
        algorithm: 'ECDSA',
        hash: 'SHA-256',
        keyLength: 2048,
        curve: 'P-256',
    })
    const [subject, setSubject] = useState<subject>({
        commonName: '',
        organisation: '',
        organisationalUnit: '',
        locality: '',
        country: ''
    })
    const [extensions, setExtensions] = useState([defaultSAN])

    const [doGenerateKey, setDoGenerateKey] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [privateKey, setPrivateKey] = useState('')
    const [publicKey, setPublicKey] = useState('')

    return <Stack spacing={2}
        direction="column"
        justifyContent="center"
        alignItems="center">
        <Typography variant='h5'> Key Details </Typography>

        <Stack direction="row" spacing={2} width='100%'>
            <FormControl fullWidth>
                <InputLabel id='algorithm-label'>Algorithm</InputLabel>
                <Select labelId='algorithm-label'
                    label='Algorithm'
                    value={keyDetails.algorithm}
                    onChange={e => setKeyDetails({ ...keyDetails, algorithm: e.target.value })}>
                    <MenuItem value="RSASSA-PKCS1-V1_5">RSASSA-PKCS1-V1_5</MenuItem>
                    <MenuItem value="RSA-PSS">RSA-PSS</MenuItem>
                    <MenuItem value="ECDSA">ECDSA</MenuItem>
                </Select>
            </FormControl>

            <FormControl fullWidth>
                <InputLabel id='hash-algorithm-label'>Hash Algorithm</InputLabel>
                <Select labelId='hash-algorithm-label'
                    label='Hash Algorithm'
                    value={keyDetails.hash}
                    onChange={e => setKeyDetails({ ...keyDetails, hash: e.target.value })}>
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
                    disabled={!doGenerateKey || keyDetails.algorithm !== 'ECDSA'}
                    value={keyDetails.curve}
                    onChange={e => setKeyDetails({ ...keyDetails, curve: e.target.value })}>
                    <MenuItem value="P-256">P-256</MenuItem>
                    <MenuItem value="P-384">P-384</MenuItem>
                    <MenuItem value="P-521">P-521</MenuItem>
                </Select>
            </FormControl>

            <FormControl fullWidth>
                <TextField label="Key Length (RSA Only)"
                    variant="outlined"
                    placeholder="2048"
                    disabled={!doGenerateKey || keyDetails.algorithm === 'ECDSA'}
                    value={keyDetails.keyLength}
                    onChange={(e) => setKeyDetails({ ...keyDetails, keyLength: Number(e.target.value) })} />
            </FormControl>
        </Stack>

        <Stack direction='row' spacing={2} alignItems='center'>
            <Button variant={doGenerateKey ? 'contained' : 'outlined'}
                startIcon={doGenerateKey ? <Check /> : <Key />}
                onClick={() => setDoGenerateKey(true)}>
                Generate Keypair
            </Button>
            <Typography>or</Typography>
            <Button variant={doGenerateKey ? 'outlined' : 'contained'}
                startIcon={doGenerateKey ? <CloudUpload /> : <Check />}
                onClick={() => { setDoGenerateKey(false); setModalOpen(true) }}>
                Provide Keypair
            </Button>
        </Stack>

        <KeyUploadModal open={modalOpen}
            onClose={() => { setModalOpen(false); setPrivateKey(''); setPublicKey(''); setDoGenerateKey(true); }}
            onSubmit={(priv, pub) => { setPrivateKey(priv); setPublicKey(pub); setModalOpen(false); }} />

        <Divider> <Typography variant='h5'> Subject Details </Typography> </Divider>


        <FormControl fullWidth>
            <TextField label="Common Name"
                variant="outlined"
                placeholder="My New Certificate"
                value={subject.commonName}
                onChange={(e) => setSubject({ ...subject, commonName: e.target.value })} />
        </FormControl>

        <Stack direction="row" spacing={2} width='100%'>
            <FormControl fullWidth>
                <TextField label="Organisation"
                    variant="outlined"
                    placeholder="Evil Corp"
                    value={subject.organisation}
                    onChange={(e) => setSubject({ ...subject, organisation: e.target.value })} />
            </FormControl>
            <FormControl fullWidth>
                <TextField label="Organisational Unit"
                    variant="outlined"
                    placeholder="EC Finance Dept"
                    value={subject.organisationalUnit}
                    onChange={(e) => setSubject({ ...subject, organisationalUnit: e.target.value })} />
            </FormControl>
        </Stack>

        <Stack direction="row" spacing={2} width='100%'>
            <FormControl fullWidth>
                <TextField label="Locality"
                    variant="outlined"
                    placeholder="Chicago"
                    value={subject.locality}
                    onChange={(e) => setSubject({ ...subject, locality: e.target.value })} />
            </FormControl>
            <FormControl fullWidth>
                <TextField label="Country"
                    variant="outlined"
                    placeholder="USA"
                    value={subject.country}
                    onChange={(e) => setSubject({ ...subject, country: e.target.value })} />
            </FormControl>
        </Stack>

        <Divider color='#fff'> <Typography variant='h5'> Extensions </Typography> </Divider>

        <MultiInput rows={extensions}
            addRow={() => setExtensions(old => [...old, defaultSAN])}
            deleteRow={(idx: number) => setExtensions(old => old.filter((_, i) => i !== idx))}
            onChange={(idx: number, newValue: RowContent) => setExtensions(old => old.map((existingVal: RowContent, i: number) => i === idx ? newValue : existingVal))}
        />

        <Button hidden={!props.loading} variant='contained' disabled>
            <CircularProgress size={18} sx={{ mx: 1 }} /> Generating
        </Button>
        <Button hidden={props.loading} variant='contained'
            startIcon={<Create />}
            onClick={() => generateCSR(props, keyDetails, subject, extensions, privateKey, publicKey, doGenerateKey)}>
            Generate CSR
        </Button>

    </Stack>
}