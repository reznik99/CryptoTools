import * as pkijs from 'pkijs';
import * as asn1js from 'asn1js';
import { RowContent } from 'components/MultiInput';


// Root OIDs
export const oidExtensionsRequest = '1.2.840.113549.1.9.14'    // pkcs-9-at-extensionRequest

// Subject OIDs
const oidCN = '2.5.4.3'                                 // Common Name
const oidC = '2.5.4.6'                                  // Country
const oidL = '2.5.4.7'                                  // Locality
const oidO = '2.5.4.10'                                 // Organisation
const oidOU = '2.5.4.11'                                // OrganisationalUnit

// Extension OIDs
const otherName = 0                                     // [0] AnotherName         [IMPLICIT OtherName]
const rfc822Name = 1                                    // [1] IA5String           [IMPLICIT IA5STRING]
const dNSName = 2                                       // [2] IA5String           [IMPLICIT IA5STRING]
const x400Address = 3                                   // [3] ORAddress           [IMPLICIT SeqOfAny]          -- Not supported
const directoryName = 4                                 // [4] Name                [EXPLICIT ANY]
const ediPartyName = 5                                  // [5] EDIPartyName        [IMPLICIT SeqOfAny]
const uniformResourceLocator = 6                        // [6] IA5String           [IMPLICIT IA5STRING]
const iPAddress = 7                                     // [7] OCTET STRING        [IMPLICIT OCTETSTRING]
const registeredID = 8                                  // [8] OBJECT IDENTIFIER   [IMPLICIT EncodedObjectID]   -- Not supported

const nameToOid = new Map<string, string>([
    ["CN", oidCN],
    ["C", oidC],
    ["L", oidL],
    ["O", oidO],
    ["OU", oidOU],
])

export const createCN = (commonName: string): pkijs.AttributeTypeAndValue => {
    return new pkijs.AttributeTypeAndValue({
        type: oidCN,
        value: new asn1js.Utf8String({ value: commonName })
    })
}

export const createC = (country: string): pkijs.AttributeTypeAndValue => {
    return new pkijs.AttributeTypeAndValue({
        type: oidC,
        value: new asn1js.PrintableString({ value: country })
    });
}

export const createL = (locality: string): pkijs.AttributeTypeAndValue => {
    return new pkijs.AttributeTypeAndValue({
        type: oidL,
        value: new asn1js.Utf8String({ value: locality })
    })
}

export const createO = (organisation: string): pkijs.AttributeTypeAndValue => {
    return new pkijs.AttributeTypeAndValue({
        type: oidO,
        value: new asn1js.Utf8String({ value: organisation })
    })
}

export const createOU = (organisationalUnit: string): pkijs.AttributeTypeAndValue => {
    return new pkijs.AttributeTypeAndValue({
        type: oidOU,
        value: new asn1js.Utf8String({ value: organisationalUnit })
    })
}

export const createSKIExtension = async (publicKey: CryptoKey): Promise<pkijs.Extension> => {
    const publicKeyRaw = await window.crypto.subtle.exportKey('spki', publicKey)
    const ski = await window.crypto.subtle.digest({ name: "SHA-1" }, publicKeyRaw);
    const skiBER = new asn1js.OctetString({ valueHex: ski }).toBER(false)

    return new pkijs.Extension({
        extnID: pkijs.id_SubjectKeyIdentifier,
        critical: false,
        extnValue: skiBER
    })
}

export const createSANExtension = (extensionsArray: RowContent[]): pkijs.Extension | null => {
    const filteredExtensions = extensionsArray.filter(row => { return Boolean(row.value.trim()) })
    if (!filteredExtensions.length) return null

    const altNames = new pkijs.GeneralNames({
        names: filteredExtensions.map(row => createAltName(row.type, row.value))
    })

    return new pkijs.Extension({
        extnID: pkijs.id_SubjectAltName,
        critical: false,
        extnValue: altNames.toSchema().toBER(),
        parsedValue: altNames
    })
}

const createAltName = (type: string, value: string): pkijs.GeneralName => {
    const extension = new pkijs.GeneralName()
    switch (type) {
        case 'OtherName':
            // TODO: pkijs has a bug that causes a nested sequence, which isn't correct. Can't fix without forking PKIJS.
            // https://github.com/PeculiarVentures/PKI.js/issues/395
            extension.type = otherName
            extension.value = new asn1js.Sequence({
                value: [
                    new asn1js.ObjectIdentifier({ value: '1.3.6.1.4.1.311.20.2.3' }),
                    new asn1js.Constructed({
                        idBlock: {
                            tagClass: 3,
                            tagNumber: 0
                        },
                        value: [
                            new asn1js.Utf8String({ value: value })
                        ],
                    }),
                ]
            })
            return extension
        case 'EmailAddress':
            extension.type = rfc822Name
            extension.value = value
            return extension
        case 'DNSName':
            extension.type = dNSName
            extension.value = value
            return extension
        case 'DirectoryName':
            const values = value.split(',')
            extension.type = directoryName
            extension.value = new pkijs.RelativeDistinguishedNames({
                typesAndValues: values.map(subval => {
                    const [type, value] = subval.split('=')
                    const typeOid = nameToOid.get(type)
                    return new pkijs.AttributeTypeAndValue({
                        type: typeOid || oidCN,
                        value: new asn1js.Utf8String({ value: value })
                    })
                })
            })
            return extension
        case 'UniformResourceLocator':
            extension.type = uniformResourceLocator
            extension.value = encodeURI(value)
            return extension
        case 'IPAddress':
            const octets = value.split('.').map(val => parseInt(val))
            extension.type = iPAddress
            extension.value = new asn1js.OctetString({ valueHex: (new Uint8Array(octets)).buffer })
            return extension
        default:
            // default to DNS
            extension.type = dNSName
            extension.value = value
            return extension
    }
}
