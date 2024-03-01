import React from 'react';
import { Divider, FormControl, IconButton, InputLabel, MenuItem, Paper, Select, Stack, TextField } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { validateDNS, validateEmail, validateIPv4, validateURL } from 'lib/validation';

interface IProps {
    rows: Array<RowContent>,
    onChange: (idx: number, newValue: RowContent) => void,
    addRow: () => void,
    deleteRow: (index: number) => void
}

interface RowContent {
    value: string,
    type: string,
}

const validateField = (field: RowContent) => {
    if (!field.value.length) return true

    switch (field.type) {
        case 'DNSName':
            return validateDNS(field.value)
        case 'EmailAddress':
            return validateEmail(field.value)
        case 'UniformResourceLocator':
            return validateURL(field.value)
        case 'IPAddress':
            return validateIPv4(field.value)
    }

    return true
}

function MultiInput(props: IProps) {

    return (
        <>
            {props.rows.map((row, idx) => {
                const fieldValid = validateField(row)
                return <Stack direction="row" spacing={2} width='100%' key={idx}>
                    <FormControl fullWidth>
                        <TextField label="Value"
                            error={!fieldValid}
                            color={fieldValid ? 'success' : 'primary'}
                            variant="outlined"
                            placeholder="Extension Value"
                            helperText={!fieldValid ? `Invalid ${row.type}` : ''}
                            value={row.value}
                            onChange={(e) => props.onChange(idx, { type: row.type, value: e.target.value })} />
                    </FormControl>

                    <FormControl fullWidth>
                        <Stack direction="row">
                            <InputLabel id='extension-label'>Extension Type</InputLabel>
                            <Select labelId='extension-label' sx={{ width: '100%' }}
                                label='Extension Type'
                                value={row.type}
                                onChange={(e) => props.onChange(idx, { type: e.target.value, value: row.value })}>
                                <MenuItem value="DNSName">DNS Name</MenuItem>
                                <MenuItem value="IPAddress">IP Address</MenuItem>
                                <MenuItem value="EmailAddress">Email Address</MenuItem>
                                <MenuItem value="UniformResourceLocator">Uniform Resource Locator</MenuItem>
                                <MenuItem value="DirectoryName">Directory Name</MenuItem>
                                <MenuItem value="OtherName" disabled>Other Name</MenuItem>
                            </Select>

                            <Paper component="form" sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}>
                                <IconButton type="button" aria-label="search"
                                    color='error'
                                    onClick={() => props.deleteRow(idx)}
                                    disabled={props.rows.length <= 1}>
                                    <Delete />
                                </IconButton>
                                <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                                <IconButton type="button" aria-label="search"
                                    color='success'
                                    onClick={() => props.addRow()}>
                                    <Add />
                                </IconButton>
                            </Paper>
                        </Stack>
                    </FormControl>
                </Stack>
            })}
        </>
    )
}


export {
    RowContent,
    MultiInput
}