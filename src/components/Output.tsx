import React from 'react';
import { Props } from 'types/SharedTypes';
import { FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Stack, TextField } from '@mui/material';
import { CopyAll } from '@mui/icons-material';

export const textfieldMonoStyle = { style: { fontFamily: 'monospace' } }

function Output(props: Props) {
    const inputLabel = props.input?.length ? `(${props.input.length.toLocaleString()} characters)` : "Input"
    const outputLabel = props.output?.length ? `(${props.output.length.toLocaleString()} characters)` : "Output"

    const copyText = () => {
        navigator.clipboard.writeText(props.output || '')
        props.setState({ showInfo: true, infoMsg: 'Copied to clipboard' })
    }

    return (
        <Stack spacing={2}
            direction="column"
            justifyContent="center"
            alignItems="center">

            <FormControl fullWidth>
                <TextField multiline
                    maxRows={5}
                    inputProps={textfieldMonoStyle}
                    label={inputLabel}
                    variant="outlined"
                    placeholder="Input for action i.e Public/Private Key"
                    value={props.input}
                    onChange={e => props.setState({ input: e.target.value })} />
            </FormControl>

            <FormControl fullWidth hidden={!Boolean(props.output)}>
                <InputLabel>{outputLabel}</InputLabel>
                <OutlinedInput multiline
                    maxRows={10}
                    inputProps={textfieldMonoStyle}
                    label={outputLabel}
                    placeholder="Output of action i.e CSR or Key"
                    value={props.output}
                    onChange={e => props.setState({ output: e.target.value })}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton onClick={copyText} edge="end">
                                <CopyAll color='primary'/>
                            </IconButton>
                        </InputAdornment>
                    }
                />
            </FormControl>

        </Stack >
    )
}

export default Output