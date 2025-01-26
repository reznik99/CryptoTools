import { useState } from 'react';
import { Buffer } from 'buffer';
import { Alert, AlertTitle, Button, CircularProgress, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select, Stack, TextField, Typography } from '@mui/material';
import { CheckBox, CheckBoxOutlineBlank, Info, Key } from '@mui/icons-material';

import { Props } from 'types/SharedTypes';
import { hkdfImportOpts, importKey } from 'lib/crypto';

const hkdf = async (props: Props, hashAlgo: string, keyMaterial: Buffer, salt: Buffer, info: Buffer) => {
    try {
        props.setState({ loading: true })
        // Import raw key material
        const baseKey = await importKey(keyMaterial, hkdfImportOpts)
        // Derive key from key material using HKDF
        const derivedKey = await crypto.subtle.deriveBits(
            {
                name: "HKDF",
                salt: salt,
                info: info,
                hash: hashAlgo,
            },
            baseKey,
            256,
        );

        props.setState({ output: `Derived Key: ${Buffer.from(derivedKey).toString('base64')}\nSalt: ${salt.toString('base64')}` })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: `Failed to derive key (HKDF): ${err}` })
    } finally {
        props.setState({ loading: false })
    }
}

export default function HKDF(props: Props) {
    const [hashAlgo, setHashAlgo] = useState('SHA-256')
    const [salt, setSalt] = useState('')
    const [genSalt, setGenSalt] = useState(true)
    const [info, setInfo] = useState('')
    const [secret, setSecret] = useState('')

    const submit = () => {
        // Secret is required
        if (!secret) {
            props.setState({ errorMsg: `Master secret is required!` })
            return
        }
        // Info is optional
        const t_info = info.length
            ? Buffer.from(info)
            : Buffer.alloc(0)
        // Use existing or generate new salt
        const t_salt = !genSalt
            ? Buffer.from(salt, 'base64')
            : Buffer.from(window.crypto.getRandomValues(new Uint8Array(32)))
        const secretBuf = Buffer.from(secret, 'base64')
        // Derive key
        hkdf(props, hashAlgo, secretBuf, t_salt, t_info)
    }

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
                    value={info}
                    onChange={(e) => setInfo(e.target.value)} />
            </FormControl>
        </Stack>

        <Stack direction="row" spacing={2} width='100%'>
            <FormControl fullWidth>
                <TextField label="Master Secret"
                    variant="outlined"
                    placeholder="(base64) Initial master secret to derive keys from"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)} />
            </FormControl>
            <FormControl fullWidth >
                <InputLabel htmlFor="outlined-adornment-salt">Salt</InputLabel>
                <OutlinedInput
                    id="outlined-adornment-salt"
                    startAdornment={
                        <InputAdornment position="start">
                            <IconButton onClick={e => setGenSalt(!genSalt)} edge="start">
                                {genSalt ? <CheckBox /> : <CheckBoxOutlineBlank />}
                            </IconButton>
                        </InputAdornment>
                    }
                    label="Salt"
                    placeholder={genSalt ? "Auto-generated" : "Base64 random value with the same length as digest function output"}
                    disabled={genSalt}
                    value={salt}
                    onChange={(e) => setSalt(e.target.value)} />
            </FormControl>
        </Stack>

        {props.loading
            ? <Button variant='contained' disabled>
                <CircularProgress size={18} sx={{ mx: 1 }} /> Generating
            </Button>
            : <Button variant='contained' startIcon={<Key />} onClick={submit}>Derive</Button>
        }
    </Stack >
}
