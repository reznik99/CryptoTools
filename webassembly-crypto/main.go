//go:build js && wasm

package main

import (
	"crypto"
	"crypto/rand"
	"crypto/sha1"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/asn1"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"log"
	"math/big"
	"syscall/js"
	"time"
)

func main() {
	// Create a channel to keep the Go program alive
	done := make(chan struct{}, 0)

	// Expose the Go functions to JavaScript
	js.Global().Set("ParseX509Certificate", js.FuncOf(ParseX509Certificate))
	js.Global().Set("SignX509Certificate", js.FuncOf(SignX509Certificate))

	// Block the program from exiting
	<-done
}

// ParseX509Certificate parses a certificate pem and returns a stringified json struct with the details
func ParseX509Certificate(this js.Value, args []js.Value) interface{} {
	certificate := args[0].String()

	p, _ := pem.Decode([]byte(certificate))
	if p == nil {
		log.Printf("Error parsing certificate pem")
		return nil
	}

	cert, err := x509.ParseCertificate(p.Bytes)
	if err != nil {
		log.Printf("Error parsing certificate der: %s", err)
		return nil
	}

	output, err := json.Marshal(cert)
	if err != nil {
		log.Printf("Error marshalling certificate into JSON: %s", err)
		return nil
	}

	return string(output)
}

// SignX509Certificate signs the passed in CSR using the provided private key and certificate (if provided)
func SignX509Certificate(this js.Value, args []js.Value) interface{} {
	pemCsr := args[0].String()
	pemSignerKey := args[1].String()
	pemSignerCert := args[2].String()
	selfSign := args[3].Bool()

	// Parse PKCS10
	csr, err := parsePEMCsr(pemCsr)
	if err != nil {
		log.Printf("Error parsing csr: %s", err)
		return nil
	}
	// Parse PKCS8
	priv, err := parsePEMPrivateKey(pemSignerKey)
	if err != nil {
		log.Printf("Error parsing signer private key: %s", err)
		return nil
	}

	// Fill CSR details (TODO: Support custom expiry & key usages)
	serialNumber, err := generateSerialNumber()
	if err != nil {
		log.Printf("Error generating random serial: %s", err)
		return nil
	}
	ski, err := generateSubjectKeyID(csr.PublicKey)
	if err != nil {
		log.Printf("Error generating subject key identifier: %s", err)
		return nil
	}

	template := &x509.Certificate{
		PublicKey:          csr.PublicKey,
		SerialNumber:       serialNumber,
		Subject:            csr.Subject,
		SubjectKeyId:       ski,
		NotBefore:          time.Now(),
		NotAfter:           time.Now().AddDate(1, 0, 0),
		KeyUsage:           x509.KeyUsageDigitalSignature | x509.KeyUsageCRLSign,
		ExtKeyUsage:        []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth, x509.ExtKeyUsageClientAuth},
		IsCA:               false,
		DNSNames:           csr.DNSNames,
		EmailAddresses:     csr.EmailAddresses,
		IPAddresses:        csr.IPAddresses,
		PublicKeyAlgorithm: csr.PublicKeyAlgorithm,
	}

	// Parse X509 cert if required
	parent := &x509.Certificate{}
	if !selfSign {
		parent, err = parsePEMCertificate(pemSignerCert)
		if err != nil {
			log.Printf("Error parsing signer certificate: %s", err)
			return nil
		}
	} else {
		// Self signed
		parent = template
		template.AuthorityKeyId = ski
		template.IsCA = true
	}

	// Sign certificate and return in PEM encoded format
	newCert, err := x509.CreateCertificate(rand.Reader, template, parent, template.PublicKey, priv)
	if err != nil {
		log.Printf("Error signing certificate: %s", err)
		return nil
	}
	newCertPem := pem.EncodeToMemory(&pem.Block{
		Type:  "CERTIFICATE",
		Bytes: newCert,
	})

	return string(newCertPem)
}

// Utilities

type subjectPublicKeyInfo struct {
	Algorithm        pkix.AlgorithmIdentifier
	SubjectPublicKey asn1.BitString
}

func generateSubjectKeyID(pub crypto.PublicKey) ([]byte, error) {
	b, err := x509.MarshalPKIXPublicKey(pub)
	if err != nil {
		return nil, err
	}
	var info subjectPublicKeyInfo
	if _, err = asn1.Unmarshal(b, &info); err != nil {
		return nil, err
	}
	hash := sha1.Sum(info.SubjectPublicKey.Bytes)
	return hash[:], nil
}

func generateSerialNumber() (*big.Int, error) {
	serialNumberLimit := new(big.Int).Lsh(big.NewInt(1), 128)
	serialNumber, err := rand.Int(rand.Reader, serialNumberLimit)
	if err != nil {
		return nil, fmt.Errorf("failed to generate serial number: %s", err)
	}

	return serialNumber, nil
}

func parsePEMCertificate(pemSignerCert string) (*x509.Certificate, error) {
	b, _ := pem.Decode([]byte(pemSignerCert))
	if b == nil {
		return nil, fmt.Errorf("invalid pem certificate")
	}

	cert, err := x509.ParseCertificate(b.Bytes)
	if err != nil {
		return nil, err
	}

	return cert, nil
}

func parsePEMCsr(pemSignerCert string) (*x509.CertificateRequest, error) {
	b, _ := pem.Decode([]byte(pemSignerCert))
	if b == nil {
		return nil, fmt.Errorf("invalid pem certificate signing request")
	}

	cert, err := x509.ParseCertificateRequest(b.Bytes)
	if err != nil {
		return nil, err
	}

	return cert, nil
}

func parsePEMPrivateKey(pemSignerKey string) (any, error) {
	b, _ := pem.Decode([]byte(pemSignerKey))
	if b == nil {
		return nil, fmt.Errorf("invalid pkcs8 private key pem")
	}

	priv, err := x509.ParsePKCS8PrivateKey(b.Bytes)
	if err != nil {
		return nil, err
	}

	return priv, nil
}
