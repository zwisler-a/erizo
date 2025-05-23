import {Injectable} from '@nestjs/common';
import * as crypto from 'crypto';
import {createPublicKey} from 'crypto';

@Injectable()
export class CryptoService {
    loadPublicKey(base64Key: string) {
        const spkiDer = Buffer.from(base64Key, 'base64');
        return createPublicKey({
            key: spkiDer,
            format: 'der',
            type: 'spki',
        });
    }

    encryptMessage(publicKeyBase64: string, message: string): string {
        const publicKey = this.loadPublicKey(publicKeyBase64);
        const ciphertext = crypto.publicEncrypt(
            {
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256',
            },
            Buffer.from(message, 'utf-8'),
        );
        return ciphertext.toString('base64');
    }

    async generateHash(input: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash))
            .map((byte) => ('00' + byte.toString(16)).slice(-2))
            .join('')
            .substring(0, 16);
    }
}
