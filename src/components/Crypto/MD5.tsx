import React, { useState } from 'react';
import { Buffer } from 'buffer';
import { Button, CircularProgress, FormControl, Stack, TextField, Typography } from '@mui/material';

import { Props } from 'types/SharedTypes';
import { Draw } from '@mui/icons-material';

const digest = async (props: Props, message: string) => {
    try {
        props.setState({ loading: true })
        const hash = window.Md5Digest(Buffer.from(message, 'ascii').toString('base64'))
        props.setState({ output: Buffer.from(hash).toString('base64'), successMsg: `(MD5) Hashed successfully` })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: `Failed to digest data: ${err}` })
    } finally {
        props.setState({ loading: false })
    }
}

export default function MD5(props: Props) {
    const [message, setMessage] = useState('')
    return (
        <Stack spacing={2}
            direction="column"
            justifyContent="center"
            alignItems="center"
            sx={{ minHeight: '50vh' }}>
            <Typography variant='h4'> MD5 Hash </Typography>

            <FormControl fullWidth>
                <TextField label="Message"
                    variant="outlined"
                    placeholder="ASCII message to hash"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)} />
            </FormControl>

            <Button hidden={!props.loading} variant='contained' disabled>
                <CircularProgress size={18} sx={{ mx: 1 }} /> Hashing
            </Button>
            <Button hidden={props.loading} variant='contained'
                startIcon={<Draw />}
                onClick={() => digest(props, message)}>
                Digest
            </Button>
        </Stack>
    )
}