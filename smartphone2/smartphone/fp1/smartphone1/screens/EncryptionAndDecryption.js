import * as FileSystem from 'expo-file-system';
import { getRandomBytesAsync } from 'expo-crypto';
import CryptoJS from 'crypto-js';

// Secure AES-256 Encryption Key
const ENCRYPTION_KEY = CryptoJS.SHA256('assalamoalaikumwarahmatuAllah').toString(CryptoJS.enc.Hex);

export const encryptImage = async (uri) => {
    try {
        // Read image file as Base64
        const imageData = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        // Generate a secure IV (16 bytes)
        const ivArray = await getRandomBytesAsync(16);
        const iv = CryptoJS.lib.WordArray.create(ivArray);

        // Encrypt the image using AES
        const encrypted = CryptoJS.AES.encrypt(imageData, CryptoJS.enc.Hex.parse(ENCRYPTION_KEY), {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });

        return {
            encryptedImage: encrypted.toString(), // Encrypted image
            iv: CryptoJS.enc.Base64.stringify(iv), // Store IV as Base64
        };
    } catch (error) {
        console.error('Encryption error:', error);
        throw error;
    }
};

export const decryptImage = async (encryptedData, iv) => {
    try {
        const ivWordArray = CryptoJS.enc.Base64.parse(iv);

        // Decrypt the image
        const decrypted = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Hex.parse(ENCRYPTION_KEY), {
            iv: ivWordArray,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });

        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Decryption error:', error);
        throw error;
    }
};
