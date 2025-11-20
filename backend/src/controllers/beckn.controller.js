const crypto = require("crypto");
const { blake2b } = require("blakejs");
const fs = require("fs");
const path = require("path");

exports.signBecknRequest = (payload) => {
  try {
    // Point to your private key file inside utils
    const privateKeyPath = path.resolve(__dirname, "../utils/private_key.pem");
    const privateKeyPem = fs.readFileSync(privateKeyPath, "utf8");

    // Create an Ed25519 private key object
    const privateKey = crypto.createPrivateKey({
      key: privateKeyPem,
      format: "pem",
      type: "pkcs8",   // Ed25519 requires PKCS#8
    });

    // Hash payload with Blake2b (64 bytes, as per Beckn spec)
    const hash = blake2b(JSON.stringify(payload), null, 64);

    // Sign the hash using Ed25519
    const signature = crypto.sign(null, Buffer.from(hash), privateKey);

    return signature.toString("base64");
  } catch (error) {
    console.error("Error signing Beckn request:", error);
    throw error;
  }
};
