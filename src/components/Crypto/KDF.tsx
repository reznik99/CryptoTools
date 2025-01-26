import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Buffer } from 'buffer';
import { Alert, AlertTitle, Button, CircularProgress, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select, Stack, TextField, Typography } from '@mui/material';
import { CheckBox, CheckBoxOutlineBlank, Info, Key } from '@mui/icons-material';

import { Props } from 'types/SharedTypes';

const HKDF = async (props: Props, hashAlgo: string, keyMaterial: Buffer, salt: Buffer, info: Buffer) => {
    try {
        props.setState({ loading: true })
        // Import raw key material
        const baseKey = await crypto.subtle.importKey(
            'raw',
            keyMaterial,
            { name: "HKDF" },
            true,
            ["deriveKey"]
        );
        // Derive key from key material using HKDF and salt
        const derivedKey = await crypto.subtle.deriveKey(
            {
                name: "HKDF",
                salt: salt,
                info: info,
                hash: hashAlgo,
            },
            baseKey,
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
        const derivedKeyStr = await crypto.subtle.exportKey('raw', derivedKey)
        props.setState({ output: Buffer.from(derivedKeyStr).toString('base64') })
    } catch (err) {
        console.error(`Failed to derive key (HKDF): ${err}`)
        props.setState({ errorMsg: `Failed to derive key (HKDF): ${err}` })
    } finally {
        props.setState({ loading: false })
    }
}

const DeriveKey = async (props: Props, kdfAlgo: string, hashAlgo: string, keyMaterial: Buffer, salt: Buffer, info: Buffer) => {
    switch (kdfAlgo) {
        case "HKDF":
            await HKDF(props, hashAlgo, keyMaterial, salt, info)
            return;
        case "PBKDF2":
        case "ECDH":
        case "X25519":
        default:
            props.setState({ errorMsg: `${kdfAlgo}(${hashAlgo}) is unimplemented` })
    }
}

function kdfAlgoDescription(kdfAlgo: string) {
    switch (kdfAlgo) {
        case "HKDF":
            return (
                <Typography>HKDF is a key derivation function.<br /> It's designed to derive key material from some high-entropy input,
                    such as the output of an ECDH key agreement operation.<br /> It's not designed to derive keys from relatively
                    low-entropy inputs such as passwords. For that, use PBKDF2.
                </Typography>
            )
        case "PBKDF2":
            return (
                <Typography>PBKDF2 is a key derivation function.<br /> It's designed to derive key material from some relatively
                    low-entropy input, such as a password. <br /> It derives key material by applying a function such as HMAC to the
                    input password along with some salt, and repeating this process many times.<br /> The more times the process is
                    repeated, the more computationally expensive key derivation is: this makes it harder for an attacker to use
                    brute-force to discover the key using a dictionary attack.
                </Typography>
            )
        case "ECDH":
            return (
                <Typography>ECDH (Elliptic Curve Diffie-Hellman) is a key-agreement algorithm.<br /> It enables two people who each have
                    an ECDH public/private key pair to generate a shared secret.<br />
                    They can then use this shared secret as a symmetric key to secure their communication, or can use the secret as an
                    input to derive such a key (for example, using the HKDF algorithm).
                </Typography>
            )
        case "X25519":
            return (
                <Typography>X25519 is a key agreement algorithm like ECDH, but built on the Curve25519 elliptic curve.<br /> The Curve25519
                    algorithms are widely used in cryptography, and are considered to be some of the most efficient/fast available.
                </Typography>
            )
        default:
            return <Typography>Unrecognized algorithm</Typography>
    }
}

export default function KDF(props: Props) {
    const [kdfAlgo, setKDFAlgo] = useState('HKDF')
    const [hashAlgo, setHashAlgo] = useState('SHA-256')
    const [hkdfInfo, setHkdfInfo] = useState('')
    const [hkdfSalt, setHkdfSalt] = useState('')
    const [hkdfGenSalt, setHkdfGenSalt] = useState(true)
    const { action } = useParams();

    switch (action) {
        case 'Gen':
            return <Stack spacing={2}
                direction="column"
                alignItems="center"
                sx={{ minHeight: '50vh', paddingTop: 10 }}>
                <Typography variant='h4'> Generate KDF </Typography>

                <Stack direction="row" spacing={2} width='100%'>
                    <FormControl fullWidth>
                        <InputLabel id='kdf-algo-label'>KDF Algo</InputLabel>
                        <Select labelId='kdf-algo-label'
                            label='KDF Algo'
                            value={kdfAlgo}
                            onChange={(e) => setKDFAlgo(e.target.value)}>
                            <MenuItem value="HKDF">HKDF</MenuItem>
                            <MenuItem value="PBKDF2">PBKDF2</MenuItem>
                            <MenuItem value="ECDH">ECDH</MenuItem>
                            <MenuItem value="X25519">X25519</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel id='hash-algo-label'>Hash Algo</InputLabel>
                        <Select labelId='hash-algo-label'
                            label='Hash Algo'
                            value={hashAlgo}
                            onChange={(e) => setHashAlgo(e.target.value)}>
                            <MenuItem value="SHA-1">SHA-1</MenuItem>
                            <MenuItem value="SHA-256">SHA-256</MenuItem>
                            <MenuItem value="SHA-384">SHA-384</MenuItem>
                            <MenuItem value="SHA-512">SHA-512</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>

                <Stack direction="row" spacing={2} width='100%'>
                    <FormControl fullWidth>
                        <TextField label="Info"
                            variant="outlined"
                            placeholder="Application-specific contextual information (Optional)"
                            value={hkdfInfo}
                            onChange={(e) => setHkdfInfo(e.target.value)} />
                    </FormControl>


                    <FormControl fullWidth >
                        <InputLabel htmlFor="outlined-adornment-salt">Salt</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-salt"
                            startAdornment={
                                <InputAdornment position="start">
                                    <IconButton onClick={e => setHkdfGenSalt(!hkdfGenSalt)} edge="start">
                                        {hkdfGenSalt ? <CheckBox /> : <CheckBoxOutlineBlank />}
                                    </IconButton>
                                </InputAdornment>
                            }
                            label="Salt"
                            placeholder={hkdfGenSalt ? "Auto-generated" : "Base64 random value with the same length as digest function output"}
                            disabled={hkdfGenSalt}
                            value={hkdfSalt}
                            onChange={(e) => setHkdfSalt(e.target.value)} />
                    </FormControl>
                </Stack>

                {
                    props.loading
                        ? <Button variant='contained' disabled>
                            <CircularProgress size={18} sx={{ mx: 1 }} /> Generating
                        </Button>
                        : <Button variant='contained'
                            startIcon={<Key />}
                            onClick={() => DeriveKey(
                                props,
                                kdfAlgo,
                                hashAlgo,
                                Buffer.from(props.input, 'base64'),
                                hkdfSalt.length && !hkdfGenSalt ? Buffer.from(hkdfSalt, 'base64') : Buffer.from(crypto.getRandomValues(new Uint8Array(32))),
                                hkdfInfo.length ? Buffer.from(hkdfInfo) : Buffer.alloc(0)
                            )}>
                            Generate KDF
                        </Button>
                }


                <Alert color="info" icon={<Info />} sx={{ width: '100%' }}>
                    <AlertTitle>{kdfAlgo} Algorithm Information</AlertTitle>
                    {kdfAlgoDescription(kdfAlgo)}
                </Alert>

            </Stack >
        default:
            return <></>
    }
}