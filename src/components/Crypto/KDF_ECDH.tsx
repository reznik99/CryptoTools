import { useState } from 'react';
import { Buffer } from 'buffer';
import { Alert, AlertTitle, Button, CircularProgress, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { CloudUpload, Info, Key } from '@mui/icons-material';

import { Props } from 'types/SharedTypes';
import { importKey, ecdhPrivImportOpts, ecdhPubImportOpts } from 'lib/crypto';
import FileUploadBtn from 'components/FileUploadBtn';
import { textfieldMonoStyle } from 'components/Output';
import { decodePEM } from 'lib/encoding';

const ecdh = async (props: Props, privateKey: string, publicKey: string, curve: string, sharedSecretBitLength: number) => {
    try {
        props.setState({ loading: true })
        // Import Alice private key
        const privOpts = { ...ecdhPrivImportOpts }
        privOpts.algorithm.namedCurve = curve
        const alicePrivate = await importKey(decodePEM("PRIVATE KEY", privateKey), privOpts)
        // Import Bob public key
        const pubOpts = { ...ecdhPubImportOpts }
        pubOpts.algorithm.namedCurve = curve
        const bobPublic = await importKey(decodePEM("PUBLIC KEY", publicKey), pubOpts)
        // Derive shared secret with ECDH
        const sharedSecret = await crypto.subtle.deriveBits(
            {
                name: "ECDH",
                namedCurve: curve,
                public: bobPublic,
            } as any,
            alicePrivate,
            sharedSecretBitLength
        );
        props.setState({ output: Buffer.from(sharedSecret).toString('base64') })
    } catch (err) {
        console.error(err)
        props.setState({ errorMsg: `Failed to derive shared secret (ECDH): ${err}` })
    } finally {
        props.setState({ loading: false })
    }
}

export default function ECDH(props: Props) {
    const [curve, setCurve] = useState('P-256')
    const [publicKey, setPublicKey] = useState('')
    const [privateKey, setPrivateKey] = useState('')
    const [sharedSecretBitLength, setSharedSecretBitLength] = useState(256)

    return <Stack spacing={2}
        direction="column"
        alignItems="center"
        sx={{ minHeight: '50vh', paddingTop: 5 }}>
        <Typography variant='h4'> Elliptic Curve Diffie-Hellman </Typography>

        <Alert color="info" icon={<Info />} sx={{ width: '100%' }}>
            <AlertTitle>ECDH (Elliptic Curve Diffie-Hellman) is a key-agreement algorithm.</AlertTitle>
            <Typography>It enables two people who each have an ECDH public/private key pair to generate a shared secret.<br />
                They can then use this shared secret as a symmetric key to secure their communication, or can use the secret as an
                input to derive such a key (for example, using the HKDF algorithm).
            </Typography>
        </Alert>

        <Stack direction="row" spacing={2} width='100%'>
            <Stack direction="column" spacing={2} width='100%'>
                <FileUploadBtn onRead={(priv) => setPrivateKey(String(priv))}
                    startIcon={<CloudUpload />}
                    maxNameLength={15}
                    acceptFiles='.pem, .key, .p8, .priv'>
                    Select Alice's Private Key
                </FileUploadBtn>
                <TextField fullWidth multiline
                    rows={8}
                    label='Private Key'
                    placeholder='PKCS8 Private key file in PEM format (Alice)'
                    slotProps={{ htmlInput: textfieldMonoStyle }}
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)} />
            </Stack>
            <Stack direction="column" spacing={2} width='100%'>
                <FileUploadBtn onRead={(pub) => setPublicKey(String(pub))}
                    startIcon={<CloudUpload />}
                    maxNameLength={15}
                    acceptFiles='.pem, .key, .pub'>
                    Select Bob's Public Key
                </FileUploadBtn>
                <TextField fullWidth multiline
                    rows={8}
                    label='Public Key'
                    placeholder='PKIX Public key file in PEM format (Bob)'
                    slotProps={{ htmlInput: textfieldMonoStyle }}
                    value={publicKey}
                    onChange={(e) => setPublicKey(e.target.value)} />
            </Stack>
        </Stack>

        <Stack direction="row" spacing={2} width='100%'>
            <FormControl fullWidth>
                <InputLabel id='curve-label'>Curve</InputLabel>
                <Select labelId='curve-label'
                    label='Curve'
                    value={curve}
                    onChange={(e) => setCurve(e.target.value)}>
                    <MenuItem value="P-256">P-256</MenuItem>
                    <MenuItem value="P-384">P-384</MenuItem>
                    <MenuItem value="P-521">P-521</MenuItem>
                </Select>
            </FormControl>
            <FormControl fullWidth>
                <InputLabel id='bit-length-label'>Shared Secret bit-length</InputLabel>
                <Select labelId='bit-length-label'
                    label='Shared Secret bit-length'
                    value={sharedSecretBitLength}
                    onChange={(e) => setSharedSecretBitLength(Number(e.target.value) || 256)}>
                    <MenuItem value={128}>128-bit</MenuItem>
                    <MenuItem value={256}>256-bit</MenuItem>
                    <MenuItem value={384} disabled={parseInt(curve.split("-")[1]) < 384}>384-bit</MenuItem>
                    <MenuItem value={521} disabled={parseInt(curve.split("-")[1]) < 521}>521-bit</MenuItem>
                </Select>
            </FormControl>
        </Stack>

        {
            props.loading
                ? <Button variant='contained' disabled>
                    <CircularProgress size={18} sx={{ mx: 1 }} /> Generating
                </Button>
                : <Button variant='contained'
                    startIcon={<Key />}
                    onClick={() => ecdh(props, privateKey, publicKey, curve, sharedSecretBitLength)}>
                    Derive
                </Button>
        }
    </Stack >
}

{/* 
<Typography>X25519 is a key agreement algorithm like ECDH, but built on the Curve25519 elliptic curve.<br /> The Curve25519
algorithms are widely used in cryptography, and are considered to be some of the most efficient/fast available.
</Typography> 
*/}