import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, ButtonGroup, CircularProgress, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { CloudUpload, Key, Lock, LockOpen, Download } from '@mui/icons-material';
import { Buffer } from 'buffer';

import { Props, CryptoSettings } from 'types/SharedTypes';
import FileUploadBtn from 'components/FileUploadBtn';
import FileDownloadBtn from 'components/FileDownloadBtn';

const keyUsages: Array<KeyUsage> = ["encrypt", "decrypt"];
const keyUsagesHMAC: Array<KeyUsage> = ["sign", "verify"];

const generateIV = (aesMode: string) => {
    let ivLen = 16
    switch (aesMode) {
        case 'AES-CBC':
            ivLen = 16; // 16 Bytes IV
            break;
        case 'AES-GCM':
            ivLen = 12; // 12 Bytes Nonce
            break;
        case 'AES-CTR':
            ivLen = 12; // 12 Bytes Counter
            break;
    }
    return window.crypto.getRandomValues(new Uint8Array(ivLen));
}

const importAES = async (key: string, settings: CryptoSettings) => {
    const binaryDer = Buffer.from(key, 'base64')

    return window.crypto.subtle.importKey(
        "raw",
        binaryDer,
        settings.algorithm,
        true,
        settings.keyUsages
    );
}

const generateAES = async (props: Props, keyLength: number) => {
    try {
        props.setState({ loading: true })
        const key = await window.crypto.subtle.generateKey(
            {
                name: "AES-GCM",
                length: keyLength
            },
            true,
            ["encrypt", "decrypt"]
        );

        const exported = await window.crypto.subtle.exportKey("raw", key)

        props.setState({ output: Buffer.from(exported).toString('base64'), successMsg: `(AES-${keyLength}) Generated successfully` })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: `Failed to generate AES key: ${err}` })
    } finally {
        props.setState({ loading: false })
    }
}

const encryptAES = async (props: Props, aesMode: string, message: string) => {
    try {
        props.setState({ loading: true })

        const settings: CryptoSettings = {
            algorithm: { name: aesMode },
            keyUsages: keyUsages
        }
        const key = await importAES(props.input, settings)
        const iv = generateIV(aesMode);

        const cipherText = await window.crypto.subtle.encrypt(
            {
                name: aesMode,
                iv: iv
            },
            key,
            Buffer.from(message, 'ascii')
        );

        props.setState({
            output: `ciphertext: ${Buffer.from(cipherText).toString('base64')}\niv: ${Buffer.from(iv).toString('base64')}`,
            successMsg: `(${aesMode}) Encrypted successfully`
        })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: `Failed to encrypt: ${err}` })
    } finally {
        props.setState({ loading: false })
    }
}

const decryptAES = async (props: Props, aesMode: string, message: string, ivText: string) => {
    try {
        props.setState({ loading: true })

        const settings = {
            algorithm: { name: aesMode },
            keyUsages: keyUsages
        }
        const key = await importAES(props.input, settings)
        const iv = Buffer.from(ivText, 'base64');

        const plainText = await window.crypto.subtle.decrypt(
            {
                name: aesMode,
                iv: iv
            },
            key,
            Buffer.from(message, 'base64')
        );

        props.setState({ output: Buffer.from(plainText).toString(), successMsg: `(${aesMode}) Decrypted successfully` })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: `Failed to decrypt: ${err}` })
    } finally {
        props.setState({ loading: false })
    }
}

const signAES = async (props: Props, hash: string, message: string) => {
    try {
        props.setState({ loading: true })

        const settings = {
            algorithm: {
                name: 'HMAC',
                hash: hash
            },
            keyUsages: keyUsagesHMAC
        }
        const key = await importAES(props.input, settings)

        const sig = await crypto.subtle.sign('HMAC', key, Buffer.from(message))
        props.setState({ output: Buffer.from(sig).toString('base64'), successMsg: `(HMAC-${hash}) Signed successfully` })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: `Failed to sign: ${err}` })
    } finally {
        props.setState({ loading: false })
    }
}

const verifyAES = async (props: Props, hash: string, message: string, signature: string) => {
    try {
        props.setState({ loading: true })

        const settings = {
            algorithm: {
                name: 'HMAC',
                hash: hash
            },
            keyUsages: keyUsagesHMAC
        }
        const key = await importAES(props.input, settings)
        const valid = await crypto.subtle.verify('HMAC', key, Buffer.from(signature, 'base64'), Buffer.from(message))

        if (valid) props.setState({ output: "Valid", successMsg: `(HMAC-${hash}) Verified successfully` });
        else props.setState({ output: "Invalid", errorMsg: `(HMAC-${hash}) Verification failed` });
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: `Failed to verify: ${err}` })
    } finally {
        props.setState({ loading: false })
    }
}

export default function AES(props: Props) {
    const [aesMode, setAESMode] = useState('AES-GCM')
    const [hashAlgo, setHashAlgo] = useState('SHA-256')
    const [keyLength, setKeyLength] = useState(256)
    const [message, setMessage] = useState('')
    const [signature, setSignature] = useState('')
    const [iv, setIV] = useState('')

    const { action } = useParams();

    switch (action) {
        case '':
        case 'Gen':
            return (
                <Stack spacing={2}
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                    sx={{ minHeight: '50vh' }}>
                    <Typography variant='h4'> Generate Key </Typography>
                    <FormControl fullWidth sx={{ my: 2 }}>
                        <InputLabel id='keysize-label'>Key Size</InputLabel>
                        <Select labelId='keysize-label'
                            label='Key Size'
                            value={keyLength}
                            onChange={(e) => setKeyLength(Number(e.target.value))} >
                            <MenuItem value={128}>128-bits</MenuItem>
                            <MenuItem value={192}>192-bits</MenuItem>
                            <MenuItem value={256}>256-bits</MenuItem>
                        </Select>
                    </FormControl>
                    {props.loading
                        ? <Button variant='contained' disabled><CircularProgress size={18} sx={{ mx: 1 }} /> Generating...</Button>
                        : <Button variant='contained' startIcon={<Key />}
                            onClick={() => generateAES(props, keyLength)}>Generate AES Key</Button>
                    }

                    <FileDownloadBtn hide={!props.output} data={props.output || ''} fileName='AES.key'>
                        Download Key (Base64)
                    </FileDownloadBtn>

                </Stack>
            )
        case 'Enc':
            return (
                <Stack spacing={2}
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                    sx={{ minHeight: '50vh' }}>
                    <Typography variant='h4'> Encrypt/Decrypt </Typography>
                    <FormControl fullWidth>
                        <InputLabel id='algorithm-label'>Algorithm</InputLabel>
                        <Select labelId='algorithm-label'
                            label='Algorithm'
                            value={aesMode}
                            onChange={e => setAESMode(e.target.value)}>
                            <MenuItem value='AES-CBC'>AES-CBC</MenuItem>
                            <MenuItem value='AES-GCM'>AES-GCM</MenuItem>
                            <MenuItem value='AES-CTR' disabled>AES-CTR</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField fullWidth
                        label="Plaintext / Ciphertext"
                        variant="outlined"
                        placeholder="ASCII (for encryption) | Base64 (for decryption)"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        InputProps={{
                            sx: { paddingRight: 0 },
                            endAdornment:
                                <FileUploadBtn onRead={(data) => setMessage(String(data))}
                                    startIcon={<CloudUpload />}>
                                    UploadFile
                                </FileUploadBtn>
                        }}
                    />

                    <FormControl fullWidth>
                        <TextField label="IV / Nonce"
                            variant="outlined"
                            placeholder="Base64 (for decryption)"
                            value={iv}
                            onChange={(e) => setIV(e.target.value)}
                        />
                    </FormControl>

                    {props.loading
                        ? <ButtonGroup >
                            <Button variant='contained' disabled><CircularProgress size={18} sx={{ mx: 1 }} /> Decrypting</Button>
                            <Button variant='contained' disabled><CircularProgress size={18} sx={{ mx: 1 }} /> Encrypting</Button>
                        </ButtonGroup>
                        : <ButtonGroup>
                            <Button variant='contained'
                                startIcon={<LockOpen />}
                                onClick={() => decryptAES(props, aesMode, message, iv)}>Decrypt data</Button>
                            <Button variant='contained'
                                startIcon={<Lock />}
                                onClick={() => encryptAES(props, aesMode, message)}>Encrypt data</Button>
                        </ButtonGroup>
                    }
                </Stack>
            )
        case 'Sig':
            return (
                <Stack spacing={2}
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                    sx={{ minHeight: '50vh' }}>
                    <Typography variant='h4'> Sign/Verify </Typography>
                    <FormControl fullWidth>
                        <InputLabel id='algorithm-label'>Algorithm</InputLabel>
                        <Select labelId='algorithm-label'
                            label='Algorithm'
                            value={hashAlgo}
                            onChange={e => setHashAlgo(e.target.value)}>
                            <MenuItem value='SHA-1'>HMAC-SHA1</MenuItem>
                            <MenuItem value='SHA-256'>HMAC-SHA256</MenuItem>
                            <MenuItem value='SHA-384'>HMAC-SHA384</MenuItem>
                            <MenuItem value='SHA-512'>HMAC-SHA512</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField fullWidth
                        label="Message"
                        variant="outlined"
                        placeholder="ASCII"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />

                    <FormControl fullWidth>
                        <TextField label="Signature"
                            variant="outlined"
                            placeholder="Base64 (for verification)"
                            value={signature}
                            onChange={(e) => setSignature(e.target.value)}
                        />
                    </FormControl>

                    {props.loading
                        ? <ButtonGroup >
                            <Button variant='contained' disabled><CircularProgress size={18} sx={{ mx: 1 }} /> Verify</Button>
                            <Button variant='contained' disabled><CircularProgress size={18} sx={{ mx: 1 }} /> Sign</Button>
                        </ButtonGroup>
                        : <ButtonGroup>
                            <Button variant='contained'
                                startIcon={<LockOpen />}
                                onClick={() => verifyAES(props, hashAlgo, message, signature)}>Verify</Button>
                            <Button variant='contained'
                                startIcon={<Lock />}
                                onClick={() => signAES(props, hashAlgo, message)}>Sign</Button>
                        </ButtonGroup>
                    }
                </Stack>
            )
        default:
            return <></>
    }
}