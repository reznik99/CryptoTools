import * as pkijs from 'pkijs';
import * as asn1js from 'asn1js';
import { RowContent } from 'components/MultiInput';

type extenionID = 0 | 1 | 2 | 6 | 3 | 4 | 7 | 8

// Root OIDs
const oidExtensionsRequest = '1.2.840.113549.1.9.14'    // pkcs-9-at-extensionRequest
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

export const createExtensions = (extensionsArray: RowContent[]) => {
    const altNames = new pkijs.GeneralNames({ names: [] })

    altNames.names = extensionsArray.map((row, idx) => {
        return new pkijs.GeneralName({
            type: nameToExtensionID(row.type),
            value: row.value
        })
    })

    const extensions = new pkijs.Extensions({
        extensions: [
            new pkijs.Extension({
                extnID: oidAlternativeNames,
                critical: false,
                extnValue: altNames.toSchema().toBER(false)
            }),
        ]
    })

    return new pkijs.Attribute({
        type: oidExtensionsRequest,
        values: [extensions.toSchema()]
    })
}

const nameToExtensionID = (type: string): extenionID => {
    switch (type) {
        case "DNSName":
            return dNSName
        default:
            return dNSName // default to DNS
    }
}