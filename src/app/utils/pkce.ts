import CryptoJS from 'crypto-js';

export const generateVerifier = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const verifier = [];

    for (let i = 0; i < 128; i++) {
        const index = Math.floor(Math.random() * chars.length);
        verifier.push(chars[index]);
    }

    return verifier.join('');
}

export const generateChallenge = (verifier: string) => {
    const hashed = CryptoJS.SHA256(verifier);
    return base64UrlEncode(hashed.toString(CryptoJS.enc.Base64));
}

export const base64UrlEncode = (input: string) => {
    return input
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}
