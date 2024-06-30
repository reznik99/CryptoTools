import { useCallback, useState } from "react";
import { Button, CircularProgress, Divider, Stack, TextField, Typography } from "@mui/material";
import { Check, CloudUpload, Create, Key } from "@mui/icons-material";
import FileDownloadBtn from "components/FileDownloadBtn";
import FileUploadBtn from "components/FileUploadBtn";
import { Props } from "types/SharedTypes";


export default function Certificate(props: Props) {
    const [selfSign, setSelfSign] = useState(false)
    const [csr, setCsr] = useState("")
    const [signerKey, setSignerKey] = useState("")
    const [signerCert, setSignerCert] = useState("")
    const [newCertificate, setNewCertificate] = useState("")

    const signCertificate = useCallback(async () => {
        try {
            props.setState({ loading: true })
            const newCertificate = window.SignX509Certificate(csr, signerKey, signerCert, selfSign)
            if (!newCertificate) throw new Error("Failed to sign certificate request")

            props.setState({ output: newCertificate, successMsg: `Certificate generated successfully` });
            setNewCertificate(newCertificate)
        } catch (err) {
            console.error("WASM error:", err)
            props.setState({ errorMsg: `Certificate generation failed: ${err}` });
        } finally {
            props.setState({ loading: false })
        }
    }, [csr, signerKey, signerCert, selfSign])

    return <Stack spacing={2}
        direction="column"
        justifyContent="center"
        alignItems="center">

        <Typography variant='h5'> Certificate Signing Request </Typography>

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

        <Divider> <Typography variant='h5'> Signer Details </Typography> </Divider>

        <Stack direction='row' justifyContent="center" width="100%">
            <TextField fullWidth
                label="Signer Private Key"
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

        <Stack direction='row' spacing={2} alignItems='center'>
            <Button variant={selfSign ? 'contained' : 'outlined'}
                startIcon={selfSign ? <Check /> : <Key />}
                onClick={() => setSelfSign(true)}>
                Self-Sign
            </Button>
            <Typography>or</Typography>
            <Button variant={selfSign ? 'outlined' : 'contained'}
                startIcon={selfSign ? <Key /> : <Check />}
                onClick={() => setSelfSign(false)}>
                Sign with cert
            </Button>
        </Stack>

        <Stack direction='row' justifyContent="center" width="100%">
            <TextField fullWidth
                label="Signer Certificate"
                variant="outlined"
                disabled={selfSign}
                placeholder="PEM encoded X509 certificate"
                value={signerCert}
                onChange={(e) => setSignerCert(e.target.value)}
            />
            <FileUploadBtn sx={{ width: 200 }}
                disabled={selfSign}
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
            onClick={signCertificate}>
            Create Certificate
        </Button>

        <FileDownloadBtn hide={!newCertificate} data={newCertificate || ''} fileName={`certificate.crt`}>
            Certificate (PEM)
        </FileDownloadBtn>
    </Stack>
}
