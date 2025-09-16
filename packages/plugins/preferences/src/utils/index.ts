import { getWebcryptoSubtle } from "@better-auth/utils";
import { base64 } from "@better-auth/utils/base64";

export * from "./check-scope-permission";
export * from "./merge";
export * from "./path";
export * from "./transform";

const deriveKey = async (secretKey: string): Promise<CryptoKey> => {
	const enc = new TextEncoder();
	const subtle = getWebcryptoSubtle();
	const keyMaterial = await subtle.importKey(
		"raw",
		enc.encode(secretKey),
		{ name: "PBKDF2" },
		false,
		["deriveKey"],
	);

	return subtle.deriveKey(
		{
			name: "PBKDF2",
			salt: enc.encode("encryption_salt"),
			iterations: 100_000,
			hash: "SHA-256",
		},
		keyMaterial,
		{ name: "AES-GCM", length: 256 },
		false,
		["encrypt", "decrypt"],
	);
};

export const encrypt = async (
	value: string,
	secretKey: string,
): Promise<{
	encryptedValue: string;
	iv: string;
}> => {
	const key = await deriveKey(secretKey); // Derive a 32-byte key from the provided secret
	const iv = crypto.getRandomValues(new Uint8Array(12)); // 12-byte IV for AES-GCM

	const enc = new TextEncoder();
	const ciphertext = await getWebcryptoSubtle().encrypt(
		{
			name: "AES-GCM",
			iv,
		},
		key,
		enc.encode(value),
	);

	const encryptedValue = base64.encode(ciphertext);
	const ivBase64 = base64.encode(iv);

	return {
		encryptedValue,
		iv: ivBase64,
	};
};

export const decrypt = async (
	encrypted: {
		encryptedValue: string;
		iv: string;
	},
	secretKey: string,
): Promise<string> => {
	const key = await deriveKey(secretKey);
	const { encryptedValue, iv } = encrypted;

	const ivBuffer = base64.decode(iv);
	const ciphertext = base64.decode(encryptedValue);

	const decrypted = await getWebcryptoSubtle().decrypt(
		{
			name: "AES-GCM",
			iv: ivBuffer as BufferSource,
		},
		key,
		ciphertext as BufferSource,
	);

	const dec = new TextDecoder();
	return dec.decode(decrypted);
};
