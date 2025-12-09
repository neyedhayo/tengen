// Get Qubic identity from seed in .env
require('dotenv').config();
const qubicLib = require('@qubic-lib/qubic-ts-library');
const crypto = qubicLib.default.crypto;

async function getIdentity() {
    const seed = process.env.QUBIC_SEED;

    if (!seed || seed.length !== 55) {
        console.error('❌ Error: QUBIC_SEED not properly configured');
        console.error('   Seed must be exactly 55 lowercase letters');
        process.exit(1);
    }

    try {
        // Wait for crypto module to initialize
        const cryptoModule = await crypto;

        // Convert seed to bytes
        const seedBytes = new Uint8Array(55);
        for (let i = 0; i < 55; i++) {
            seedBytes[i] = seed.charCodeAt(i) - 'a'.charCodeAt(0);
        }

        // Hash the seed to get private key
        const privateKey = new Uint8Array(32);
        cryptoModule.K12(seedBytes, privateKey, 32);

        // Generate public key from private key
        const publicKey = cryptoModule.schnorrq.generatePublicKey(privateKey);

        // Convert public key to identity (55 uppercase letters)
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let identity = '';

        // Convert 32-byte public key to base-26 string
        const view = new DataView(publicKey.buffer);
        for (let i = 0; i < 4; i++) {
            let value = view.getBigUint64(i * 8, true);
            let segment = '';
            for (let j = 0; j < 14; j++) {
                segment = alphabet[Number(value % 26n)] + segment;
                value = value / 26n;
            }
            identity += segment;
        }

        // Add checksum (last 4 characters for 60 total)
        const checksumInput = new Uint8Array(32 + 56);
        checksumInput.set(publicKey, 0);
        for (let i = 0; i < 56; i++) {
            checksumInput[32 + i] = identity.charCodeAt(i) - 'A'.charCodeAt(0);
        }
        const checksum = new Uint8Array(4);
        cryptoModule.K12(checksumInput, checksum, 4);

        for (let i = 0; i < 4; i++) {
            identity += alphabet[checksum[i] % 26];
        }

        console.log('🔑 Identity derived from seed:');
        console.log(identity);

        return identity;
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

getIdentity();
