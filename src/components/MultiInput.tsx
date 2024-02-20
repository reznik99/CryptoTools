import React from 'react';
import { Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';

interface IProps {
    Rows: Array<RowContent>,
    onChange: (idx: number, newValue: RowContent) => void,
    AddRow: () => void,
    DeleteRow: (index: number) => void
}

interface RowContent {
    value: string,
    type: string,
}

function MultiInput(props: IProps) {

    return (
        <>
            {props.Rows.map((row, idx) => (
                <Stack direction="row" spacing={2} width='100%'>

                    <FormControl fullWidth>
                        <TextField label="Value"
                            variant="outlined"
                            placeholder="Extension Value"
                            value={row.value}
                            onChange={(e) => props.onChange(idx, { type: row.type, value: e.target.value })} />
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel id='extension-label'>Extension Type</InputLabel>
                        <Select labelId='extension-label'
                            label='Extension Type'
                            value={row.type}
                            onChange={(e) => props.onChange(idx, { type: e.target.value, value: row.value })}>
                            <MenuItem value="DNSName">DNS Name</MenuItem>
                            <MenuItem value="IPAddress">IP Address</MenuItem>
                            <MenuItem value="EmailAddress">Email Address</MenuItem>
                            <MenuItem value="DirectoryName">Directory Name</MenuItem>
                            <MenuItem value="OtherName">Other Name</MenuItem>
                        </Select>
                    </FormControl>


                    <Button variant='contained'
                        color='error'
                        onClick={() => props.DeleteRow(idx)} disabled={props.Rows.length <= 1}>
                        X
                    </Button>
                    <Button variant='contained'
                        color='success'
                        onClick={() => props.AddRow()}>
                        +
                    </Button>
                </Stack>
            ))}
        </>
    )
}


export {
    RowContent,
    MultiInput
}