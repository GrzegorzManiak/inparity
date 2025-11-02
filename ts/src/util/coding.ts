function encUrlSafe(data: Uint8Array): string {
    let base64: string;

    if (typeof btoa === 'function') {
        let binary = '';
        const chunk = 0x8000;
        for (let i = 0; i < data.length; i += chunk) {
            binary += String.fromCharCode(...data.subarray(i, i + chunk));
        }
        base64 = btoa(binary);
    }

    // @ts-ignore
    else if (typeof Buffer !== 'undefined') base64 = Buffer.from(data).toString('base64');
    else throw new Error('No base64 encoder available');

    let out = '';
    for (let i = 0; i < base64.length; i++) {
        const c = base64[i];
        if (c === '+') out += '-';
        else if (c === '/') out += '_';
        else if (c === '=') continue;
        else out += c;
    }

    return out;
}

function decUrlSafe(data: string): Uint8Array {
    // Reverse of the above, again without regex
    let base64 = '';
    for (let i = 0; i < data.length; i++) {
        const c = data[i];
        if (c === '-') base64 += '+';
        else if (c === '_') base64 += '/';
        else base64 += c;
    }
    while (base64.length % 4) base64 += '=';

    if (typeof atob === 'function') {
        const binary = atob(base64);
        const out = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
        return out;
    }

    // @ts-ignore
    if (typeof Buffer !== 'undefined') {
        // @ts-ignore
        const buf = Buffer.from(base64, 'base64');
        return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    }

    throw new Error('No base64 decoder available');
}

export {
    encUrlSafe,
    decUrlSafe
};
