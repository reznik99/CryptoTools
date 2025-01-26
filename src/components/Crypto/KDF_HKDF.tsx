import { useState } from 'react';
import { Buffer } from 'buffer';
import { Alert, AlertTitle, Button, CircularProgress, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select, Stack, TextField, Typography } from '@mui/material';
import { CheckBox, CheckBoxOutlineBlank, Info, Key } from '@mui/icons-material';

import { Props } from 'types/SharedTypes';
import { hkdfImportOpts, importKey } from 'lib/crypto';

const hkdf = async (props: Props, hashAlgo: string, keyMaterial: Buffer, saltIn: Buffer, info: Buffer) => {
    try {
        props.setState({ loading: true })
        // Generate salt if not supplied
        let salt = saltIn;
        if (!salt.byteLength) {
            salt = Buffer.from(window.crypto.getRandomValues(new Uint8Array(32)))
        }
        // Import raw key material
        const baseKey = await importKey(keyMaterial, hkdfImportOpts)
        // Derive key from key material using HKDF
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

        props.setState({ output: `Derived Key: ${Buffer.from(derivedKeyStr).toString('base64')}\nSalt: ${salt.toString('base64')}` })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: `Failed to derive key (HKDF): ${err}` })
    } finally {
        props.setState({ loading: false })
    }
}

export default function HKDF(props: Props) {
    const [hashAlgo, setHashAlgo] = useState('SHA-256')
    const [hkdfInfo, setHkdfInfo] = useState('')
    const [hkdfSalt, setHkdfSalt] = useState('')
    const [hkdfGenSalt, setHkdfGenSalt] = useState(true)

    return <Stack spacing={2}
        direction="column"
        alignItems="center"
        sx={{ minHeight: '50vh', paddingTop: 10 }}>
        <Typography variant='h4'> Hash-Based Key Derivation </Typography>

        <Alert color="info" icon={<Info />} sx={{ width: '100%' }}>
            <AlertTitle>HKDF is a key derivation function</AlertTitle>
            <Typography>It's designed to derive key material from some high-entropy input,
                such as the output of an ECDH key agreement operation.<br /> It's not designed to derive keys from relatively
                low-entropy inputs such as passwords. For that, use PBKDF2.
            </Typography>
        </Alert>

        <Stack direction="row" spacing={2} width='100%'>
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
            <FormControl fullWidth>
                <TextField label="Info"
                    variant="outlined"
                    placeholder="Application-specific contextual information (Optional)"
                    value={hkdfInfo}
                    onChange={(e) => setHkdfInfo(e.target.value)} />
            </FormControl>
        </Stack>

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

        {
            props.loading
                ? <Button variant='contained' disabled>
                    <CircularProgress size={18} sx={{ mx: 1 }} /> Generating
                </Button>
                : <Button variant='contained'
                    startIcon={<Key />}
                    onClick={() => hkdf(
                        props,
                        hashAlgo,
                        Buffer.from(props.input, 'base64'),
                        !hkdfGenSalt ? Buffer.from(hkdfSalt, 'base64') : Buffer.alloc(0),
                        hkdfInfo.length ? Buffer.from(hkdfInfo) : Buffer.alloc(0),
                    )}>
                    Derive
                </Button>
        }
    </Stack >
}