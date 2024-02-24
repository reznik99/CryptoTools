import React, { useState } from 'react';
import { Button, CircularProgress, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { Create } from '@mui/icons-material';
import * as pkijs from 'pkijs';

import { MultiInput, RowContent } from 'components/MultiInput'
import { Props } from 'types/SharedTypes';
import { createC, createCN, createExtensions, createL, createO, createOU, createSKIExtension, oidExtensionsRequest } from 'lib/PKCS10';
import { arrayBufferToBase64 } from 'lib/encoding';

type keyDetails = {
    algorithm: string;
    hash: string;
    keyLength: number;
    curve: string;
}

type subject = {
    commonName: string;
    organisation: string;
    organisationalUnit: string;
    locality: string;
    country: string;
}

const defaultSAN = { type: 'DNSName', value: '' }

const generateCSR = async (props: Props, keyDetails: keyDetails, subject: subject, extensions: RowContent[]) => {
    try {
        props.setState({ loading: true })

        const { algorithm, hash, keyLength, curve } = keyDetails
        const { commonName, organisation, organisationalUnit, locality, country } = subject

        const csr = new pkijs.CertificationRequest()

        // Get Algorithm parameters and Generate appropriate keypair
        const algoParams = pkijs.getAlgorithmParameters(algorithm, 'generateKey')
        if ('hash' in algoParams.algorithm) {
            (algoParams.algorithm as any).hash = hash
        }
        if ('modulusLength' in algoParams.algorithm) {
            (algoParams.algorithm as any).modulusLength = keyLength
        }
        if ('namedCurve' in algoParams.algorithm) {
            (algoParams.algorithm as any).namedCurve = curve
        }

        const keypair = await window.crypto.subtle.generateKey(
            algoParams.algorithm as AlgorithmIdentifier,
            true,
            algoParams.usages
        ) as CryptoKeyPair

        // Write Public Key into CSR
        await csr.subjectPublicKeyInfo.importKey(keypair.publicKey)

        // Write CSR Subject values if present
        if (commonName.trim()) {
            csr.subject.typesAndValues.push(createCN(commonName));
        }
        if (organisation.trim()) {
            csr.subject.typesAndValues.push(createO(organisation));
        }
        if (organisationalUnit.trim()) {
            csr.subject.typesAndValues.push(createOU(organisationalUnit));
        }
        if (locality.trim()) {
            csr.subject.typesAndValues.push(createL(locality));
        }
        if (country.trim()) {
            csr.subject.typesAndValues.push(createC(country));
        }


        // Write CSR Subject Key Identifier
        const ext = new pkijs.Extensions({
            extensions: [await createSKIExtension(csr.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHexView)]
        })

        // Write CSR SANs if present
        if (extensions?.length) {
            const san = createExtensions(extensions)
            if (san) {
                ext.extensions.push(san)
            }
        }

        csr.attributes = [
            new pkijs.Attribute({
                type: oidExtensionsRequest,
                values: [ext.toSchema()]
            })
        ]

        // Sign the CSR with the appropriate Private Key
        await csr.sign(keypair.privateKey, hash);

        // Export as PEM
        const csrBER = csr.toSchema().toBER(false);
        const csrPEM = arrayBufferToBase64(csrBER);
        const algoString = `${algorithm} with ${hash} (${algorithm === 'ECDSA' ? curve : keyLength + '-bit'})`

        props.setState({ output: csrPEM, successMsg: `CSR Generated successfully: ${algoString}` });
    } catch (err) {
        console.error(err);
        props.setState({ errorMsg: `Failed to generate CSR: ${err}` })
    } finally {
        props.setState({ loading: false });
    }
}

export default function CSR(props: Props) {
    const [keyDetails, setKeyDetails] = useState<keyDetails>({
        algorithm: 'ECDSA',
        hash: 'SHA-256',
        keyLength: 2048,
        curve: 'P-256',
    })
    const [subject, setSubject] = useState<subject>({
        commonName: '',
        organisation: '',
        organisationalUnit: '',
        locality: '',
        country: ''
    })

    const [extensions, setExtensions] = useState<RowContent[]>([defaultSAN])

    return <Stack spacing={2}
        direction="column"
        justifyContent="center"
        alignItems="center">
        <Typography variant='h4'> Key Details </Typography>

        <Stack direction="row" spacing={2} width='100%'>
            <FormControl fullWidth>
                <InputLabel id='algorithm-label'>Algorithm</InputLabel>
                <Select labelId='algorithm-label'
                    label='Algorithm'
                    value={keyDetails.algorithm}
                    onChange={e => setKeyDetails({ ...keyDetails, algorithm: e.target.value })}>
                    <MenuItem value="RSASSA-PKCS1-V1_5">RSASSA-PKCS1-V1_5</MenuItem>
                    <MenuItem value="RSA-PSS">RSA-PSS</MenuItem>
                    <MenuItem value="ECDSA">ECDSA</MenuItem>
                </Select>
            </FormControl>

            <FormControl fullWidth>
                <InputLabel id='hash-algorithm-label'>Hash Algorithm</InputLabel>
                <Select labelId='hash-algorithm-label'
                    label='Hash Algorithm'
                    value={keyDetails.hash}
                    onChange={e => setKeyDetails({ ...keyDetails, hash: e.target.value })}>
                    <MenuItem value="SHA-1">SHA-1</MenuItem>
                    <MenuItem value="SHA-256">SHA-256</MenuItem>
                    <MenuItem value="SHA-384">SHA-384</MenuItem>
                    <MenuItem value="SHA-512">SHA-512</MenuItem>
                </Select>
            </FormControl>
        </Stack>

        <Stack direction="row" spacing={2} width='100%'>
            <FormControl fullWidth>
                <InputLabel id='curve-label'>Curve (ECDSA Only)</InputLabel>
                <Select labelId='curve-label'
                    label='Curve (ECDSA Only)'
                    disabled={keyDetails.algorithm !== 'ECDSA'}
                    value={keyDetails.curve}
                    onChange={e => setKeyDetails({ ...keyDetails, curve: e.target.value })}>
                    <MenuItem value="P-256">P-256</MenuItem>
                    <MenuItem value="P-384">P-384</MenuItem>
                    <MenuItem value="P-521">P-521</MenuItem>
                </Select>
            </FormControl>

            <FormControl fullWidth>
                <TextField label="Key Length (RSA Only)"
                    variant="outlined"
                    placeholder="2048"
                    disabled={keyDetails.algorithm === 'ECDSA'}
                    value={keyDetails.keyLength}
                    onChange={(e) => setKeyDetails({ ...keyDetails, keyLength: Number(e.target.value) })} />
            </FormControl>
        </Stack>

        <Typography variant='h4'> Subject Details </Typography>
        <FormControl fullWidth>
            <TextField label="Common Name"
                variant="outlined"
                placeholder="My New Certificate"
                value={subject.commonName}
                onChange={(e) => setSubject({ ...subject, commonName: e.target.value })} />
        </FormControl>

        <Stack direction="row" spacing={2} width='100%'>
            <FormControl fullWidth>
                <TextField label="Organisation"
                    variant="outlined"
                    placeholder="Evil Corp"
                    value={subject.organisation}
                    onChange={(e) => setSubject({ ...subject, organisation: e.target.value })} />
            </FormControl>
            <FormControl fullWidth>
                <TextField label="Organisational Unit"
                    variant="outlined"
                    placeholder="EC Finance Dept"
                    value={subject.organisationalUnit}
                    onChange={(e) => setSubject({ ...subject, organisationalUnit: e.target.value })} />
            </FormControl>
        </Stack>

        <Stack direction="row" spacing={2} width='100%'>
            <FormControl fullWidth>
                <TextField label="Locality"
                    variant="outlined"
                    placeholder="Chicago"
                    value={subject.locality}
                    onChange={(e) => setSubject({ ...subject, locality: e.target.value })} />
            </FormControl>
            <FormControl fullWidth>
                <TextField label="Country"
                    variant="outlined"
                    placeholder="USA"
                    value={subject.country}
                    onChange={(e) => setSubject({ ...subject, country: e.target.value })} />
            </FormControl>
        </Stack>

        <Typography variant='h4'> Extensions </Typography>
        <MultiInput rows={extensions}
            addRow={() => setExtensions(old => [...old, defaultSAN])}
            deleteRow={(idx: number) => setExtensions(old => old.filter((_, i) => i !== idx))}
            onChange={(idx: number, newValue: RowContent) => setExtensions(old => old.map((existingVal: RowContent, i: number) => i === idx ? newValue : existingVal))}
        />

        <Button hidden={!props.loading} variant='contained' disabled>
            <CircularProgress size={18} sx={{ mx: 1 }} /> Generating
        </Button>
        <Button hidden={props.loading} variant='contained'
            startIcon={<Create />}
            onClick={() => generateCSR(props, keyDetails, subject, extensions)}>
            Generate CSR
        </Button>
    </Stack>
}