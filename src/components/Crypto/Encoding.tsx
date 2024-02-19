import React, { useState } from 'react';
import { Buffer } from 'buffer';
import { Button, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

import { Props } from 'types/SharedTypes';

const encode = (data: string, inEncoding: BufferEncoding, outEncoding: BufferEncoding) => {
    return Buffer.from(data, inEncoding).toString(outEncoding)
}

export default function Encoding(props: Props) {
    const [inEncoding, setInEncoding] = useState('base64' as BufferEncoding)
    const [outEncoding, setOutEncoding] = useState('hex' as BufferEncoding)

    return (
        <Stack spacing={2}
            direction='column'
            justifyContent='center'
            alignItems='center'
            sx={{ ml: '250px' }}>
            <Typography variant='h4'> Encode/Decode </Typography>

            <Stack direction='row' spacing={2} width='100%'>
                <FormControl fullWidth>
                    <InputLabel id='from-label'>From</InputLabel>
                    <Select labelId='from-label'
                        label='From'
                        value={inEncoding}
                        onChange={e => setInEncoding(e.target.value as any)}>
                        <MenuItem value='ascii'>ASCII</MenuItem>
                        <MenuItem value='base64'>Base64</MenuItem>
                        <MenuItem value='hex'>Hex</MenuItem>
                    </Select>
                </FormControl>

                <FormControl fullWidth>
                    <InputLabel id='to-label'>To</InputLabel>
                    <Select labelId='to-label'
                        label='To'
                        value={outEncoding}
                        onChange={e => setOutEncoding(e.target.value as any)}>
                        <MenuItem value='ascii'>ASCII</MenuItem>
                        <MenuItem value='base64'>Base64</MenuItem>
                        <MenuItem value='hex'>Hex</MenuItem>
                    </Select>
                </FormControl>
            </Stack>

            <Button variant='contained'
                startIcon={<ArrowForward />}
                onClick={() => props.setState({ output: encode(props.input, inEncoding, outEncoding) })}>
                Convert
            </Button>
        </Stack>
    )
}