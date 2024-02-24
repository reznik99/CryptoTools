import * as pkijs from 'pkijs';
import * as asn1js from 'asn1js';
import { RowContent } from 'components/MultiInput';
import { Buffer } from 'buffer';


// Root OIDs
export const oidExtensionsRequest = '1.2.840.113549.1.9.14'    // pkcs-9-at-extensionRequest
const oidAlternativeNames = '2.5.29.17'                 // XCN_OID_SUBJECT_ALT_NAME2 

// Subject OIDs
const oidCN = '2.5.4.3'                                 // Common Name
const oidC = '2.5.4.6'                                  // Country
const oidL = '2.5.4.7'                                  // Locality
const oidO = '2.5.4.10'                                 // Organisation
const oidOU = '2.5.4.11'                                // OrganisationalUnit

// Extension OIDs
const otherName = 0                                     // IMPLICIT OtherName,
const rfc822Name = 1                                    // IMPLICIT IA5STRING,
const dNSName = 2                                       // IMPLICIT IA5STRING,
const x400Address = 3                                   // IMPLICIT SeqOfAny,       -- Not supported
const directoryName = 4                                 // EXPLICIT ANY,    
const ediPartyName = 5                                  // IMPLICIT SeqOfAny,
const uniformResourceLocator = 6                        // IMPLICIT IA5STRING,
const iPAddress = 7                                     // IMPLICIT OCTETSTRING,
const registeredID = 8                                  // IMPLICIT EncodedObjectID -- Not supported

const oidSubjectKeyIdentifier = '2.5.29.14'             // SKI Digest of public key

export const createCN = (commonName: string) => {
    return new pkijs.AttributeTypeAndValue({
        type: oidCN,
        value: new asn1js.Utf8String({ value: commonName.trim() })
    })
}

export const createC = (country: string) => {
    return new pkijs.AttributeTypeAndValue({
        type: oidC,
        value: new asn1js.PrintableString({ value: country.trim() })
    });
}

export const createL = (locality: string) => {
    return new pkijs.AttributeTypeAndValue({
        type: oidL,
        value: new asn1js.Utf8String({ value: locality.trim() })
    })
}

export const createO = (organisation: string) => {
    return new pkijs.AttributeTypeAndValue({
        type: oidO,
        value: new asn1js.Utf8String({ value: organisation.trim() })
    })
}

export const createOU = (organisationalUnit: string) => {
    return new pkijs.AttributeTypeAndValue({
        type: oidOU,
        value: new asn1js.Utf8String({ value: organisationalUnit.trim() })
    })
}

export const createSANExtension = (extensionsArray: RowContent[]) => {
    const filteredExtensions = extensionsArray.filter(row => { return Boolean(row.value.trim()) })
    if (!filteredExtensions.length) return null
    
    const altNames = new pkijs.GeneralNames({
        names: filteredExtensions.map(row => nameToExtensionID(row.type, row.value))
    })

    return new pkijs.Extension({
        extnID: oidAlternativeNames,
        critical: false,
        extnValue: altNames.toSchema().toBER(false)
    })
}

const nameToExtensionID = (type: string, value: string): pkijs.GeneralName => {
    const extension = new pkijs.GeneralName()
    switch (type) {
        case 'DNSName':
            extension.type = dNSName
            extension.value = value
            return extension
        case 'EmailAddress':
            extension.type = rfc822Name
            extension.value = value
            return extension
        case 'UniformResourceLocator':
            extension.type = uniformResourceLocator
            extension.value = new asn1js.IA5String({ valueHex: Buffer.from(value) })
            return extension
        case 'IPAddress':
            const octets = value.split('.').map(val => parseInt(val))
            extension.type = iPAddress
            extension.value = new asn1js.OctetString({ valueHex: (new Uint8Array([...octets])).buffer })
            return extension
        default:
            // default to DNS
            extension.type = dNSName
            extension.value = value
            return extension
    }
}

export const createSKIExtension = async (publicKey: CryptoKey) => {
    const publicKeyRaw = await window.crypto.subtle.exportKey('spki', publicKey)
    const ski = await window.crypto.subtle.digest({ name: "SHA-1" }, publicKeyRaw);
    const skiBER = new asn1js.OctetString({ valueHex: ski }).toBER(false)

    return new pkijs.Extension({
        extnID: oidSubjectKeyIdentifier,
        critical: false,
        extnValue: skiBER
    })
}