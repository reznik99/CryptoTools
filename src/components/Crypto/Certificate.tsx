import { CloudUpload, Create } from "@mui/icons-material";
import { Button, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import FileDownloadBtn from "components/FileDownloadBtn";
import FileUploadBtn from "components/FileUploadBtn";
import { useState } from "react";
import { Props } from "types/SharedTypes";


const signCertificate = async (props: Props, csr: string, signerKey: string, signerCertificate: string, setNewCertificate: (arg0: string) => void) => {
    try {
        props.setState({ loading: true })
        const newCertificate = window.SignX509Certificate(csr, signerKey, signerCertificate)
        if (!newCertificate) throw new Error("Failed to sign certificate request")

        props.setState({ output: newCertificate, successMsg: `Certificate generated successfully` });
        setNewCertificate(newCertificate)
    } catch (err) {
        console.error("WASM error:", err)
        props.setState({ errorMsg: `Certificate generation failed: ${err}` });
    } finally {
        props.setState({ loading: false })
    }
}


export default function Certificate(props: Props) {

    const [csr, setCsr] = useState("")
    const [signerKey, setSignerKey] = useState("")
    const [signerCert, setSignerCert] = useState("")
    const [newCertificate, setNewCertificate] = useState("")

    return <Stack spacing={2}
        direction="column"
        justifyContent="center"
        alignItems="center">

        <Typography variant='h4'> Certificate Signing </Typography>

        <Stack direction='row' justifyContent="center" width="100%">
            <TextField fullWidth
                label="Certificate Signing Request"
                variant="outlined"
                placeholder="PEM encoded PKCS10"
                value={csr}
                onChange={(e) => setCsr(e.target.value)}
            />
            <FileUploadBtn sx={{ width: 200 }}
                onRead={(data) => setCsr(String(data))}
                startIcon={<CloudUpload />}>
                Request
            </FileUploadBtn>
        </Stack>

        <Stack direction='row' justifyContent="center" width="100%">
            <TextField fullWidth
                label="Private Key"
                variant="outlined"
                placeholder="PEM encoded PKCS8 private key"
                value={signerKey}
                onChange={(e) => setSignerKey(e.target.value)}
            />
            <FileUploadBtn sx={{ width: 200 }}
                onRead={(data) => setSignerKey(String(data))}
                startIcon={<CloudUpload />}>
                Private Key
            </FileUploadBtn>
        </Stack>

        <Stack direction='row' justifyContent="center" width="100%">
            <TextField fullWidth
                label="Certificate"
                variant="outlined"
                placeholder="PEM encoded X509 certificate"
                value={signerCert}
                onChange={(e) => setSignerCert(e.target.value)}
            />
            <FileUploadBtn sx={{ width: 200 }}
                onRead={(data) => setSignerCert(String(data))}
                startIcon={<CloudUpload />}>
                Certificate
            </FileUploadBtn>
        </Stack>

        <Button hidden={!props.loading} variant='contained' disabled>
            <CircularProgress size={18} sx={{ mx: 1 }} /> Generating
        </Button>
        <Button hidden={props.loading} variant='contained'
            startIcon={<Create />}
            onClick={() => signCertificate(props, csr, signerKey, signerCert, setNewCertificate)}>
            Create Certificate
        </Button>

        <Stack spacing={2} direction='row'>
            <FileDownloadBtn hide={!newCertificate} data={newCertificate || ''} fileName={`newCertificate.pem`}>
                Certificate (PEM)
            </FileDownloadBtn>
        </Stack>
    </Stack>
}
