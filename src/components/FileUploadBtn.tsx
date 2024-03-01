import React, { ChangeEvent, useCallback, useState } from 'react';
import { Button } from '@mui/material';
import { Check } from '@mui/icons-material';


type Props = {
    acceptFiles?: string;
    maxNameLength?: number;
    children: React.ReactNode;
    startIcon?: React.ReactNode;
    onRead: (data: string | ArrayBuffer | null | undefined) => void;
}

function truncate(str: string, n: number) {
    return (str.length > n) ? str.slice(0, n - 1) + '...' : str;
};

export default function FileUploadBtn(props: Props) {

    const [filename, setFilename] = useState('')

    const handleFile = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const name = file.name.substring(0, file.name.lastIndexOf('.'))
        const ext = file.name.substring(file.name.lastIndexOf('.'))
        setFilename(truncate(name, props.maxNameLength ?? 10) + ext)

        // Read the file contents
        const reader = new FileReader()
        reader.readAsText(file)
        reader.onloadend = (readerEvent: ProgressEvent<FileReader>) => {
            props.onRead(readerEvent?.target?.result)
        }
    }, [props])

    return (
        <Button variant='outlined'
            color={filename ? 'success' : 'primary'}
            component='label'
            startIcon={filename ? <Check /> : props.startIcon}>
            {filename || props.children}
            <input hidden
                type='file'
                accept={props.acceptFiles ?? '*'}
                onChange={handleFile} />
        </Button>
    )
}