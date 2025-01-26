import React, { ChangeEvent, useCallback, useState } from 'react';
import { Button, SxProps, Theme } from '@mui/material';
import { Check } from '@mui/icons-material';
import { Buffer } from 'buffer';
import { isASCII, truncate } from 'lib/encoding';

type Props = {
    children: React.ReactNode;
    sx?: SxProps<Theme>;
    acceptFiles?: string;
    maxNameLength?: number;
    startIcon?: React.ReactNode;
    disabled?: boolean
    onRead: (data: string | ArrayBuffer | null | undefined) => void;
}

export default function FileUploadBtn(props: Props) {
    const [filename, setFilename] = useState('')

    const handleFile = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const name = file.name.substring(0, file.name.lastIndexOf('.'))
        const ext = file.name.substring(file.name.lastIndexOf('.'))
        setFilename(truncate(name, props.maxNameLength ?? 10) + ext)

        const result = await file.text()
        if (isASCII(result)) {
            props.onRead(Buffer.from(result).toString())
        } else {
            props.onRead(Buffer.from(result).toString('base64'))
        }
    }, [props])

    return (
        <Button sx={props.sx}
            variant='outlined'
            color={filename ? 'success' : 'primary'}
            component='label'
            disabled={props.disabled}
            startIcon={filename ? <Check /> : props.startIcon}>
            {filename || props.children}
            <input hidden
                type='file'
                accept={props.acceptFiles ?? '*'}
                onChange={handleFile} />
        </Button>
    )
}