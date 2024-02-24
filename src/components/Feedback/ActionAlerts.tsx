import * as React from 'react';
import { Snackbar, Alert, AlertTitle } from '@mui/material';

type IProps = {
    successMsg: string;
    errorMsg: string;
    setState: (state: any) => void
}

export default function ActionAlerts(props: IProps) {
    return (
        <div>
            <Snackbar open={Boolean(props.successMsg)}
                autoHideDuration={6000}
                onClose={() => props.setState({ successMsg: '' })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>

                <Alert
                    onClose={() => props.setState({ successMsg: '' })}
                    severity="success"
                    variant="standard"
                    sx={{ width: '100%' }}>
                    <AlertTitle>Success</AlertTitle>
                    {props.successMsg}
                </Alert>
            </Snackbar>
            <Snackbar open={Boolean(props.errorMsg)}
                autoHideDuration={6000}
                onClose={() => props.setState({ errorMsg: '' })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert
                    onClose={() => props.setState({ errorMsg: '' })}
                    severity="error"
                    variant="standard"
                    sx={{ width: '100%' }}>
                    <AlertTitle>Error</AlertTitle>
                    {props.errorMsg}
                </Alert>
            </Snackbar>
        </div>
    );
}
