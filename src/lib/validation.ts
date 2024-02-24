


export const validateDNS = (dnsName: string) => {
    const rx = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    return rx.test(dnsName)
}

export const validateEmail = (email: string) => {
    const rx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return rx.test(email)
}

export const validateURL = (url: string) => {
    try {
        return Boolean(new URL(url));
    }
    catch (e) {
        return false;
    }
}

export const validateIPv4 = (ipAddress: string) => {
    const rx = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/;
    return rx.test(ipAddress)
}