import { useState } from 'react';
import { Buffer } from 'buffer';
import { Alert, AlertTitle, Button, CircularProgress, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select, Stack, TextField, Typography } from '@mui/material';
import { CheckBox, CheckBoxOutlineBlank, Info, Key } from '@mui/icons-material';

import { Props } from 'types/SharedTypes';
import { pbkdf2ImportOpts, importKey } from 'lib/crypto';

const pbkdf2 = async (props: Props, hashAlgo: string, password: string, salt: Buffer, iters: number) => {
    try {
        props.setState({ loading: true })
        // Import raw key material
        const baseKey = await importKey(Buffer.from(password), pbkdf2ImportOpts)
        // Derive key from key material using PBKDF2
        const derivedKey = await crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                hash: hashAlgo,
                salt: salt,
                iterations: iters
            },
            baseKey,
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        )
        const derivedKeyStr = await crypto.subtle.exportKey("raw", derivedKey)

        let output = `Derived Key: ${Buffer.from(derivedKeyStr).toString('base64')}\n`
        output += `Salt: ${salt.toString('base64')}\n`
        output += `Iterations: ${iters}`

        props.setState({ output: output })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: `Failed to derive key (PBKDF2): ${err}` })
    } finally {
        props.setState({ loading: false })
    }
}

export default function PBKDF2(props: Props) {
    const [hashAlgo, setHashAlgo] = useState('SHA-256')
    const [salt, setSalt] = useState('')
    const [genSalt, setGenSalt] = useState(true)
    const [iters, setIters] = useState(500_000)
    const [password, setPassword] = useState('')

    const submit = () => {
        // Secret is required
        if (!password) {
            props.setState({ errorMsg: `Password is required!` })
            return
        }
        // Use existing or generate new salt
        const t_salt = !genSalt
            ? Buffer.from(salt, 'base64')
            : Buffer.from(window.crypto.getRandomValues(new Uint8Array(32)))
        // Derive key
        pbkdf2(props, hashAlgo, password, t_salt, iters)
    }

    return <Stack spacing={2}
        direction="column"
        alignItems="center"
        sx={{ minHeight: '50vh', paddingTop: 10 }}>
        <Typography variant='h4'> Password-Based Key Derivation v2 </Typography>

        <Alert color="info" icon={<Info />} sx={{ width: '100%' }}>
            <AlertTitle>PBKDF2 is a key derivation function</AlertTitle>
            <Typography>It's designed to derive key material from some relatively
                low-entropy input, such as a password. <br /> It derives key material by applying a function such as HMAC to the
                input password along with some salt, and repeating this process many times.
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
                <TextField label="PBKDF2 Iterations"
                    variant="outlined"
                    value={iters}
                    onChange={(e) => setIters(Number(e.target.value) || 500_000)} />
            </FormControl>
        </Stack>

        <Stack direction="row" spacing={2} width='100%'>
            <FormControl fullWidth>
                <TextField label="Password"
                    variant="outlined"
                    type='password'
                    placeholder="Password or secret"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} />
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

        {
            props.loading
                ? <Button variant='contained' disabled>
                    <CircularProgress size={18} sx={{ mx: 1 }} /> Generating
                </Button>
                : <Button variant='contained' startIcon={<Key />} onClick={submit}>Derive</Button>
        }
    </Stack >
}
