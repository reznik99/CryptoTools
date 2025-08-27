import React, { useState } from 'react';
import { Buffer } from 'buffer';
import { Button, CircularProgress, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';

import { Props } from 'types/SharedTypes';
import { Draw } from '@mui/icons-material';

const digest = async (props: Props, message: string, algorithm: string) => {
    try {
        props.setState({ loading: true })

        const hash = await crypto.subtle.digest(algorithm, Buffer.from(message, 'utf-8'));

        props.setState({ output: Buffer.from(hash).toString('base64'), successMsg: `(${algorithm}) Hashed successfully` })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: `Failed to digest data: ${err}` })
    } finally {
        props.setState({ loading: false })
    }
}

export default function SHA(props: Props) {
    const [algorithm, setAlgorithm] = useState('SHA-256')
    const [message, setMessage] = useState('')

    return (
        <Stack spacing={2}
            direction="column"
            justifyContent="center"
            alignItems="center"
            sx={{ minHeight: '50vh' }}>
            <Typography variant='h4'> Hash </Typography>

            <FormControl fullWidth>
                <InputLabel id='hash-algorithm-label'>Hash Algorithm</InputLabel>
                <Select labelId='hash-algorithm-label'
                    label='Hash Algorithm'
                    value={algorithm}
                    onChange={e => setAlgorithm(e.target.value)}>
                    <MenuItem value="SHA-1">SHA-1</MenuItem>
                    <MenuItem value="SHA-256">SHA-256</MenuItem>
                    <MenuItem value="SHA-384">SHA-384</MenuItem>
                    <MenuItem value="SHA-512">SHA-512</MenuItem>
                </Select>
            </FormControl>

            <FormControl fullWidth>
                <TextField label="Message"
                    variant="outlined"
                    placeholder="UTF-8 text message to hash"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)} />
            </FormControl>

            <Button hidden={!props.loading} variant='contained' disabled>
                <CircularProgress size={18} sx={{ mx: 1 }} /> Hashing
            </Button>
            <Button hidden={props.loading} variant='contained'
                startIcon={<Draw />}
                onClick={() => digest(props, message, algorithm)}>
                Digest
            </Button>
        </Stack>
    )
}