import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

type IProps = {
    infoMsg: string;
    showInfo: boolean;
    close: () => void
}

export default function InfoMessage(props: IProps) {
    return (
        <div>
            <Snackbar open={Boolean(props.showInfo)}
                autoHideDuration={2000}
                onClose={props.close}
                message={props.infoMsg}
                action={
                    <IconButton size="small" color="inherit" onClick={props.close}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
            />
        </div>
    );
}
