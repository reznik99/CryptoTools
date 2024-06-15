import React, { useCallback } from 'react';
import { Button, SxProps, Theme } from '@mui/material';
import { Download } from '@mui/icons-material';

type Props = {
    children: React.ReactNode;
    data: string | Buffer;
    fileName: string;
    hide?: boolean;
    sx?: SxProps<Theme>;
    color?: "primary" | "inherit" | "secondary" | "success" | "error" | "info" | "warning";
    variant?: "text" | "outlined" | "contained";
    startIcon?: React.ReactNode;
}

export default function FileDownloadBtn(props: Props) {

    const handleDownload = useCallback(() => {
        const url = window.URL.createObjectURL(new Blob([props.data]));
        const link = document.createElement("a");
        link.href = url;
        link.download = `crypto-tools-${props.fileName}`;
        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }, [props.data, props.fileName])

    if (props.hide) return null;

    return (
        <Button sx={props.sx}
            variant={props.variant ?? 'outlined'}
            color={props.color ?? 'primary'}
            component='label'
            startIcon={props.startIcon ?? <Download />}
            onClick={() => handleDownload()}>
            {props.children}
        </Button>
    )
}