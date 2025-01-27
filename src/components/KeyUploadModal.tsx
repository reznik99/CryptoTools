import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack, TextField } from '@mui/material';
import React, { useCallback, useState } from 'react';
import FileUploadBtn from './FileUploadBtn';
import { CloudUpload } from '@mui/icons-material';
import { textfieldMonoStyle } from './Output';

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (priv: string, pub: string) => void;
}

export function KeyUploadModal(props: Props) {
    const [privateKey, setPrivateKey] = useState('')
    const [publicKey, setPublicKey] = useState('')

    const closeModal = useCallback(() => {
        setPrivateKey('')
        setPublicKey('')
        props.onClose()
    }, [props])

    return (
        <Dialog open={props.open} onClose={closeModal} maxWidth='lg' fullWidth>
            <DialogTitle>Supply Keypair</DialogTitle>
            <DialogContent>

                <DialogContentText marginBottom={3}>
                    Supply a Private and Public key in <strong>PKCS8 & SPKI</strong> formats to be used in the generation of the CSR.
                </DialogContentText>

                <Stack direction='row' spacing={2} marginY={2} width='100%'>
                    <Stack direction='column' width='100%' spacing={3}>
                        <FileUploadBtn onRead={(priv) => setPrivateKey(String(priv))}
                            startIcon={<CloudUpload />}
                            maxNameLength={15}
                            acceptFiles='.pem, .key, .p8, .priv'>
                            Select Private Key
                        </FileUploadBtn>
                        <TextField fullWidth multiline
                            rows={10}
                            label='Private Key'
                            placeholder='PKCS8 Private key file in PEM format'
                            slotProps={{ htmlInput: textfieldMonoStyle }}
                            value={privateKey}
                            onChange={(e) => setPrivateKey(e.target.value)} />
                    </Stack>
                    <Stack direction='column' width='100%' spacing={3}>
                        <FileUploadBtn onRead={(pub) => setPublicKey(String(pub))}
                            startIcon={<CloudUpload />}
                            maxNameLength={15}
                            acceptFiles='.pem, .key, .pub'>
                            Select Public Key
                        </FileUploadBtn>
                        <TextField fullWidth multiline
                            rows={10}
                            label='Public Key'
                            placeholder='PKIX Public key file in PEM format'
                            slotProps={{ htmlInput: textfieldMonoStyle }}
                            value={publicKey}
                            onChange={(e) => setPublicKey(e.target.value)} />
                    </Stack>
                </Stack>

            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-around' }}>
                <Button variant='outlined'
                    color='warning'
                    onClick={closeModal}>
                    Cancel
                </Button>
                <Button variant='contained'
                    color='primary'
                    disabled={!privateKey || !publicKey}
                    onClick={() => props.onSubmit(privateKey, publicKey)}>
                    Ok
                </Button>
            </DialogActions>
        </Dialog>
    )
}