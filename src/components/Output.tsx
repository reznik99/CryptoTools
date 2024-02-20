import React from 'react';
import { Props } from 'types/SharedTypes';
import { FormControl, Stack, TextField } from '@mui/material';

function Output(props: Props) {
    return (
        <Stack spacing={2}
            direction="column"
            justifyContent="center"
            alignItems="center">

            <FormControl fullWidth>
                <TextField multiline
                    maxRows={5}
                    label={props.input?.length ? `(${props.input.length.toLocaleString()} characters)` : "Input"}
                    variant="outlined"
                    placeholder="Input for action i.e Public/Private Key"
                    value={props.input}
                    onChange={e => props.setState({ input: e.target.value })} />
            </FormControl>

            <FormControl fullWidth>
                <TextField multiline
                    maxRows={10}
                    label={props.output?.length ? `(${props.output.length.toLocaleString()} characters)` : "Output"}
                    variant="outlined"
                    placeholder="Output of action i.e CSR or Key"
                    value={props.output}
                    onChange={e => props.setState({ output: e.target.value })} />
            </FormControl>

        </Stack >
    )
}

export default Output