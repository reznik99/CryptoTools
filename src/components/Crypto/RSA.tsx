import React, { useState } from 'react';
import { Buffer } from 'buffer';
import { useParams } from 'react-router-dom';
import { Button, ButtonGroup, CircularProgress, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { Check, Draw, Key, Lock, LockOpen } from '@mui/icons-material';

import { Props, CryptoSettings } from 'types/SharedTypes';
import * as encoding from 'lib/encoding';
import FileDownloadBtn from 'components/FileDownloadBtn';


export const importRSAPub = async (pem: string, settings: CryptoSettings) => {
    const binaryDer = encoding.decodePEM('PUBLIC KEY', pem)

    return await window.crypto.subtle.importKey(
        "spki",
        binaryDer,
        settings.algorithm,
        true,
        settings.keyUsages
    );
}

export const importRSAPriv = async (pem: string, settings: CryptoSettings) => {
    const binaryDer = encoding.decodePEM('PRIVATE KEY', pem)

    return window.crypto.subtle.importKey(
        "pkcs8",
        binaryDer,
        settings.algorithm,
        true,
        settings.keyUsages
    );
}

const generateRSA = async (props: Props, keyLength: number, setKeypair: (arg0: any) => void) => {
    try {
        props.setState({ loading: true })
        const keypair = await window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: keyLength,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256"
            },
            true,
            ["encrypt", "decrypt"]
        );
        const [private_pem, public_pem] = await encoding.keypairToPEM(keypair)
        setKeypair({ private_pem: private_pem, public_pem: public_pem })

        props.setState({ output: `${private_pem}\n${public_pem}`, successMsg: `(RSA-${keyLength}) Generated successfully` })
    } catch (err) {
        console.error(`Failed to generate RSA-${keyLength} keypair: ${err}`)
        props.setState({ errorMsg: `Failed to generate RSA-${keyLength} keypair: ${err}` })
    } finally {
        props.setState({ loading: false })
    }
}

const encryptRSA = async (props: Props, hashAlgo: string, message: string) => {
    try {
        props.setState({ loading: true })

        const settings: CryptoSettings = {
            algorithm: {
                name: "RSA-OAEP",
                hash: hashAlgo,
            },
            keyUsages: ["encrypt"] as Array<KeyUsage>
        };

        const publicKey = await importRSAPub(props.input, settings)

        const cipherText = await window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP"
            },
            publicKey,
            Buffer.from(message, 'ascii')
        );

        props.setState({ output: Buffer.from(cipherText).toString('base64'), successMsg: `(RSA-OAEP) Encrypted successfully` })
    } catch (err) {
        console.error(`Failed to RSA-OAEP encrypt: ${err}`)
        props.setState({ errorMsg: `Failed to RSA-OAEP encrypt: ${err}` })
    } finally {
        props.setState({ loading: false })
    }
}

const decryptRSA = async (props: Props, hashAlgo: string, message: string) => {
    try {
        props.setState({ loading: true })

        const settings: CryptoSettings = {
            algorithm: {
                name: "RSA-OAEP",
                hash: hashAlgo,
            },
            keyUsages: ["decrypt"] as Array<KeyUsage>
        };
        const privateKey = await importRSAPriv(props.input, settings)

        const plainText = await window.crypto.subtle.decrypt(
            {
                name: "RSA-OAEP"
            },
            privateKey,
            Buffer.from(message, 'base64')
        );

        props.setState({ output: Buffer.from(plainText).toString(), successMsg: `(RSA-OAEP) Decrypted successfully` })
    } catch (err) {
        console.error(`Failed to RSA-OAEP decrypt: ${err}`)
        props.setState({ errorMsg: `Failed to RSA-OAEP decrypt: ${err}` })
    } finally {
        props.setState({ loading: false })
    }
}

const signRSA = async (props: Props, rsaMode: string, hashAlgo: string, message: string) => {
    try {
        props.setState({ loading: true })

        const settings: CryptoSettings = {
            algorithm: {
                name: rsaMode,
                hash: hashAlgo,
            },
            keyUsages: ["sign"] as Array<KeyUsage>
        };

        const privateKey = await importRSAPriv(props.input, settings);

        const signature = await window.crypto.subtle.sign(
            {
                name: rsaMode,
                saltLength: 32,
            },
            privateKey,
            Buffer.from(message, 'ascii')
        );

        props.setState({ output: Buffer.from(signature).toString('base64'), successMsg: `(${rsaMode}) Signed successfully` });
    } catch (err) {
        console.error(`Failed to ${rsaMode} sign: ${err}`);
        props.setState({ errorMsg: `Failed to ${rsaMode} sign: ${err}` })
    } finally {
        props.setState({ loading: false });
    }
}

const verifyRSA = async (props: Props, rsaMode: string, hashAlgo: string, message: string, signature: string) => {
    try {
        props.setState({ loading: true })

        const settings: CryptoSettings = {
            algorithm: {
                name: rsaMode,
                hash: hashAlgo,
            },
            keyUsages: ["verify"] as Array<KeyUsage>
        };

        const publicKey = await importRSAPub(props.input, settings);

        const valid = await window.crypto.subtle.verify(
            {
                name: rsaMode,
                saltLength: 32,
            },
            publicKey,
            Buffer.from(signature, 'base64'),
            Buffer.from(message, 'ascii')
        );
        if (valid) props.setState({ output: "Valid", successMsg: `${rsaMode}) Verified successfully` });
        else props.setState({ output: "Invalid", errorMsg: `${rsaMode}) Verification failed` });
    } catch (err) {
        console.error(`Failed to ${rsaMode} verify: ${err}`)
        props.setState({ errorMsg: `Failed to ${rsaMode} verify: ${err}` })
    } finally {
        props.setState({ loading: false });
    }
}

export default function RSA(props: Props) {
    const [rsaMode, setRSAMode] = useState('RSA-PSS')
    const [keyLength, setKeyLength] = useState(2048)
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
                    <TextField label="Keylength"
                        variant="outlined"
                        placeholder="2048"
                        value={keyLength}
                        onChange={(e) => setKeyLength(Number(e.target.value))}
                    />
                </FormControl>
                {props.loading
                    ? <Button variant='contained' disabled>
                        <CircularProgress size={18} sx={{ mx: 1 }} /> Generating
                    </Button>
                    : <Button variant='contained'
                        startIcon={<Key />}
                        onClick={() => generateRSA(props, keyLength, setKeypair)}>
                        Generate RSA Key
                    </Button>
                }

                <Stack spacing={2} direction='row'>
                    <FileDownloadBtn hide={!keypair.public_pem} data={keypair.public_pem || ''} fileName='rsa-public.pem'>
                        Public Key (SPKI)
                    </FileDownloadBtn>
                    <FileDownloadBtn hide={!keypair.private_pem} data={keypair.private_pem || ''} fileName='rsa-private.pem'>
                        Private Key (PKCS8)
                    </FileDownloadBtn>
                </Stack>
            </Stack>
        case 'Enc':
            return <Stack spacing={2}
                direction="column"
                justifyContent="center"
                alignItems="center"
                sx={{ minHeight: '50vh' }}>
                <Typography variant='h4'> Encrypt/Decrypt </Typography>

                <Stack direction="row" spacing={2} width='100%'>
                    <FormControl fullWidth>
                        <InputLabel id='algorithm-label'>Algorithm</InputLabel>
                        <Select labelId='algorithm-label'
                            label='Algorithm'
                            value='RSA-OAEP'>
                            <MenuItem value="RSAES-PKCS1-v1_5" disabled>RSAES-PKCS1-v1_5</MenuItem>
                            <MenuItem value="RSA-OAEP">RSA-OAEP</MenuItem>
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
                    <TextField label="PlainText / CipherText"
                        variant="outlined"
                        placeholder="Hi Mom"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </FormControl>

                {props.loading
                    ? <ButtonGroup>
                        <Button variant='contained' disabled><CircularProgress size={18} sx={{ mx: 1 }} /> Decrypting</Button>
                        <Button variant='contained' disabled><CircularProgress size={18} sx={{ mx: 1 }} /> Encrypting</Button>
                    </ButtonGroup>
                    : <ButtonGroup>
                        <Button variant='contained'
                            startIcon={<LockOpen />}
                            onClick={() => decryptRSA(props, hashAlgo, message)} disabled={props.loading}>Decrypt Data</Button>
                        <Button variant='contained'
                            startIcon={<Lock />}
                            onClick={() => encryptRSA(props, hashAlgo, message)} disabled={props.loading}>Encrypt Data</Button>
                    </ButtonGroup>
                }
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
                            value={rsaMode}
                            onChange={e => setRSAMode(e.target.value)}>
                            <MenuItem value="RSASSA-PKCS1-v1_5">RSASSA-PKCS1-v1_5</MenuItem>
                            <MenuItem value="RSA-PSS">RSA-PSS</MenuItem>
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
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </FormControl>

                <FormControl fullWidth>
                    <TextField label="Signature (required for validation)"
                        variant="outlined"
                        placeholder="Base64 signature"
                        value={signature}
                        onChange={(e) => setSignature(e.target.value)}
                    />
                </FormControl>

                {props.loading
                    ? <ButtonGroup>
                        <Button variant='contained' disabled><CircularProgress size={18} sx={{ mx: 1 }} /> Loading</Button>
                        <Button variant='contained' disabled><CircularProgress size={18} sx={{ mx: 1 }} /> Loading</Button>
                    </ButtonGroup>
                    : <ButtonGroup>
                        <Button variant='contained'
                            startIcon={<Check />}
                            onClick={() => verifyRSA(props, rsaMode, hashAlgo, message, signature)}>Validate</Button>
                        <Button variant='contained'
                            startIcon={<Draw />}
                            onClick={() => signRSA(props, rsaMode, hashAlgo, message)}>Sign</Button>
                    </ButtonGroup>
                }
            </Stack>
        default:
            return <></>
    }
}