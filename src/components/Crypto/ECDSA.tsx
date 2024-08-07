import React, { useState } from 'react';
import { Buffer } from 'buffer';
import { useParams } from 'react-router-dom';
import { Button, ButtonGroup, CircularProgress, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { Check, Draw, Key } from '@mui/icons-material';

import { Props, CryptoSettings } from 'types/SharedTypes';
import * as encoding from 'lib/encoding';
import FileDownloadBtn from 'components/FileDownloadBtn';


const sigSettings: CryptoSettings = {
    algorithm: {
        name: "ECDSA",
    },
    keyUsages: ["sign"]
}
const verSettings: CryptoSettings = {
    algorithm: {
        name: "ECDSA",
    },
    keyUsages: ["verify"]
}

export const importECDSAPub = async (pem: string, settings: CryptoSettings) => {
    const binaryDer = encoding.decodePEM('PUBLIC KEY', pem)

    return await window.crypto.subtle.importKey(
        "spki",
        binaryDer,
        settings.algorithm,
        true,
        settings.keyUsages
    );
}

export const importECDSAPriv = async (pem: string, settings: CryptoSettings) => {
    const binaryDer = encoding.decodePEM('PRIVATE KEY', pem)

    return window.crypto.subtle.importKey(
        "pkcs8",
        binaryDer,
        settings.algorithm,
        true,
        settings.keyUsages
    );
}

const generateECDSA = async (props: Props, curve: string, setKeypair: (arg0: any) => void) => {
    try {
        props.setState({ loading: true })
        const keypair = await window.crypto.subtle.generateKey(
            {
                name: "ECDSA",
                namedCurve: curve
            },
            true,
            ["sign", "verify"]
        );
        const [private_pem, public_pem] = await encoding.keypairToPEM(keypair)
        setKeypair({ private_pem: private_pem, public_pem: public_pem })

        props.setState({ output: `${private_pem}\n${public_pem}`, successMsg: `(ECDSA-${curve}) Generated successfully` })
    } catch (err) {
        console.error(`Failed to generate ECDSA ${curve}: ${err}`)
        props.setState({ errorMsg: `Failed to generate ECDSA ${curve}: ${err}` })
    } finally {
        props.setState({ loading: false })
    }
}

const signECDSA = async (props: Props, hashAlgo: string, message: string) => {
    try {
        props.setState({ loading: true })

        const privateKey = await importECDSAPriv(props.input, sigSettings)

        const signature = await window.crypto.subtle.sign(
            {
                name: "ECDSA",
                hash: { name: hashAlgo },
            },
            privateKey,
            Buffer.from(message, 'ascii')
        );

        props.setState({ output: Buffer.from(signature).toString('base64'), successMsg: `(ECDSA) Signed successfully` })
    } catch (err) {
        console.error(`Failed to ECDSA sign: ${err}`)
        props.setState({ errorMsg: `Failed to ECDSA sign: ${err}` })
    } finally {
        props.setState({ loading: false })
    }
}

const verifyECDSA = async (props: Props, hashAlgo: string, message: string, signature: string) => {
    try {
        props.setState({ loading: true })

        const publicKey = await importECDSAPub(props.input, verSettings)

        const valid = await window.crypto.subtle.verify(
            {
                name: "ECDSA",
                hash: { name: hashAlgo },
            },
            publicKey,
            Buffer.from(signature, 'base64'),
            Buffer.from(message, 'ascii')
        );

        if (valid) props.setState({ output: "Valid", successMsg: `(ECDSA) Verified successfully` })
        else props.setState({ output: "Invalid", errorMsg: `(ECDSA) Verification failed` })
    } catch (err) {
        console.error(`Failed to ECDSA verify: ${err}`)
        props.setState({ errorMsg: `Failed to ECDSA verify: ${err}` })
    } finally {
        props.setState({ loading: false })
    }
}

export default function ECDSA(props: Props) {
    const [curve, setCurve] = useState('P-256')
    const [hashAlgo, setHashAlgo] = useState('SHA-256')
    const [message, setMessage] = useState('')
    const [signature, setSignature] = useState('')
    const [keypair, setKeypair] = useState({ private_pem: '', public_pem: '' })
    const { action } = useParams();

    switch (action) {
        case 'Gen':
            return <Stack spacing={2}
                direction="column"
                justifyContent="center"
                alignItems="center"
                sx={{ minHeight: '50vh' }}>
                <Typography variant='h4'> Generate Key </Typography>

                <FormControl fullWidth>
                    <InputLabel id='curve-label'>Curve</InputLabel>
                    <Select labelId='curve-label'
                        label='Curve'
                        value={curve}
                        onChange={(e) => setCurve(e.target.value)}>
                        <MenuItem value="P-256">P-256</MenuItem>
                        <MenuItem value="P-384">P-384</MenuItem>
                        <MenuItem value="P-521">P-521</MenuItem>
                    </Select>
                </FormControl>

                {props.loading
                    ? <Button variant='contained' disabled>
                        <CircularProgress size={18} sx={{ mx: 1 }} /> Generating
                    </Button>
                    : <Button variant='contained'
                        startIcon={<Key />}
                        onClick={() => generateECDSA(props, curve, setKeypair)}>
                        Generate ECDSA Key
                    </Button>
                }

                <Stack spacing={2} direction='row'>
                    <FileDownloadBtn hide={!keypair.public_pem} data={keypair.public_pem || ''} fileName='ECDSA-public.pem'>
                        Public Key (SPKI)
                    </FileDownloadBtn>
                    <FileDownloadBtn hide={!keypair.private_pem} data={keypair.private_pem || ''} fileName='ECDSA-private.pem'>
                        Private Key (PKCS8)
                    </FileDownloadBtn>
                </Stack>

            </Stack>
        case 'Sig':
            return <Stack spacing={2}
                direction="column"
                justifyContent="center"
                alignItems="center"
                sx={{ minHeight: '50vh' }}>
                <Typography variant='h4'> Sign/Validate </Typography>
                <Stack direction="row" spacing={2} width='100%'>
                    <FormControl fullWidth>
                        <InputLabel id='algorithm-label'>Algorithm</InputLabel>
                        <Select labelId='algorithm-label'
                            label='Algorithm'
                            value='ECDSA'>
                            <MenuItem value="ECDSA">ECDSA</MenuItem>
                            <MenuItem value="EdDSA" disabled>EdDSA</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel id='hash-algorithm-label'>Hash Algorithm</InputLabel>
                        <Select labelId='hash-algorithm-label'
                            label='Hash Algorithm'
                            value={hashAlgo}
                            onChange={e => setHashAlgo(e.target.value)}>
                            <MenuItem value="SHA-1">SHA-1</MenuItem>
                            <MenuItem value="SHA-256">SHA-256</MenuItem>
                            <MenuItem value="SHA-384">SHA-384</MenuItem>
                            <MenuItem value="SHA-512">SHA-512</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>

                <FormControl fullWidth>
                    <TextField label="Message"
                        variant="outlined"
                        placeholder="Hi Mom"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)} />
                </FormControl>

                <FormControl fullWidth>
                    <TextField label="Signature (required for validation)"
                        variant="outlined"
                        placeholder="Base64 signature"
                        value={signature}
                        onChange={(e) => setSignature(e.target.value)} />
                </FormControl>

                <ButtonGroup hidden={!props.loading}>
                    <Button variant='contained' disabled><CircularProgress size={18} sx={{ mx: 1 }} /> Loading</Button>
                    <Button variant='contained' disabled><CircularProgress size={18} sx={{ mx: 1 }} /> Loading</Button>
                </ButtonGroup>
                <ButtonGroup hidden={props.loading}>
                    <Button variant='contained'
                        startIcon={<Check />}
                        onClick={() => verifyECDSA(props, hashAlgo, message, signature)}>Validate</Button>
                    <Button variant='contained'
                        startIcon={<Draw />}
                        onClick={() => signECDSA(props, hashAlgo, message)}>Sign</Button>
                </ButtonGroup>
            </Stack>
        default:
            return <></>
    }
}