import React, { useState } from 'react';
import { Buffer } from 'buffer';
import { useParams } from 'react-router-dom';
import { Button, ButtonGroup, CircularProgress, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { Key, Lock, LockOpen } from '@mui/icons-material';

import { Props, CryptoSettings } from 'types/SharedTypes';
import * as encoding from 'lib/encoding';

const keyUsages: Array<KeyUsage> = ["encrypt", "decrypt"];

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
        const exportedKeyBuffer = new Uint8Array(exported);

        props.setState({ output: encoding.arrayBufferToBase64(exportedKeyBuffer), successMsg: `(AES-${keyLength}) Generated successfully` })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: err })
    } finally {
        props.setState({ loading: false })
    }
}

const encryptAES = async (props: Props, aesMode: string, message: string) => {
    try {
        props.setState({ loading: true })

        const settings: CryptoSettings = {
            algorithm: { name: aesMode },
            keyUsages
        }
        const key = await importAES(props.input, settings)
        const iv = window.crypto.getRandomValues(new Uint8Array(16));

        const cipherText = await window.crypto.subtle.encrypt(
            {
                name: aesMode,
                iv: iv
            },
            key,
            Buffer.from(message, 'ascii')
        );

        props.setState({
            output: `ciphertext: ${encoding.arrayBufferToBase64(cipherText)}\niv: ${encoding.arrayBufferToBase64(iv)}`,
            successMsg: `(AES-CBC) Encrypted successfully`
        })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: err })
    } finally {
        props.setState({ loading: false })
    }
}

const decryptAES = async (props: Props, aesMode: string, message: string, ivText: string) => {
    try {
        props.setState({ loading: true })

        const settings = {
            algorithm: { name: aesMode },
            keyUsages
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

        props.setState({ output: encoding.arrayBufferToString(plainText), successMsg: `(AES-CBC) Decrypted successfully` })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: err })
    } finally {
        props.setState({ loading: false })
    }
}


export default function AES(props: Props) {
    const [aesMode, setAESMode] = useState('AES-GCM')
    const [keyLength, setKeyLength] = useState(256)
    const [message, setMessage] = useState('')
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
                    sx={{ mx: '250px', minHeight: '50vh' }}>
                    <Typography variant='h4'> Generate Key </Typography>
                    <FormControl fullWidth sx={{ my: 1 }}>
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
                        : <Button variant='contained'
                            startIcon={<Key />}
                            onClick={() => generateAES(props, keyLength)}>Generate AES Key</Button>
                    }
                </Stack>
            )
        case 'Enc':
            return (
                <Stack spacing={2}
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                    sx={{ mx: '250px', minHeight: '50vh' }}>
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

                    <FormControl fullWidth>
                        <TextField label="PlainText / CipherText"
                            variant="outlined"
                            placeholder="ASCII for encryption and base64 for decryption"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </FormControl>

                    <FormControl fullWidth>
                        <TextField label="IV (required for decryption)"
                            variant="outlined"
                            placeholder="Base64 IV for decryption"
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
        default:
            return <></>
    }
}