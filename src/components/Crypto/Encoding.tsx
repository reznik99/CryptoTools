import { useState } from 'react';
import { Buffer } from 'buffer';
import { Box, Button, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';
import { ArrowForward, SwapHoriz } from '@mui/icons-material';

import { Props } from 'types/SharedTypes';

const encode = (data: string, inEncoding: BufferEncoding, outEncoding: BufferEncoding) => {
    return Buffer.from(data, inEncoding).toString(outEncoding)
}

export default function Encoding(props: Props) {
    const [inEncoding, setInEncoding] = useState('utf-8' as BufferEncoding)
    const [outEncoding, setOutEncoding] = useState('hex' as BufferEncoding)

    const swapEncoding = () => {
        setInEncoding(outEncoding)
        setOutEncoding(inEncoding)
    }

    return (
        <Stack spacing={2}
            direction='column'
            justifyContent='center'
            alignItems='center'
            sx={{ minHeight: '50vh' }}>
            <Typography variant='h4'> Encode/Decode </Typography>

            <Stack direction='row' spacing={2} width='100%'>
                <FormControl fullWidth>
                    <InputLabel id='from-label'>From</InputLabel>
                    <Select labelId='from-label'
                        label='From'
                        value={inEncoding}
                        onChange={e => setInEncoding(e.target.value as any)}>
                        <MenuItem value='ascii'>ASCII</MenuItem>
                        <MenuItem value='utf-8'>UTF-8</MenuItem>
                        <MenuItem value='base64'>Base64</MenuItem>
                        <MenuItem value='hex'>Hex</MenuItem>
                    </Select>
                </FormControl>
                <Box alignSelf="center">
                    <IconButton onClick={swapEncoding}
                        color='primary'>
                        <SwapHoriz />
                    </IconButton>
                </Box>
                <FormControl fullWidth>
                    <InputLabel id='to-label'>To</InputLabel>
                    <Select labelId='to-label'
                        label='To'
                        value={outEncoding}
                        onChange={e => setOutEncoding(e.target.value as any)}>
                        <MenuItem value='ascii'>ASCII</MenuItem>
                        <MenuItem value='utf-8'>UTF-8</MenuItem>
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