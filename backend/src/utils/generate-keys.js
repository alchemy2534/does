const { generateKeyPairSync } = require('crypto');
const fs = require('fs');
const path = require('path');

try {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
  fs.writeFileSync(path.join(__dirname, 'public_key.pem'), publicKey);
  fs.writeFileSync(path.join(__dirname, 'private_key.pem'), privateKey);
  console.log('Keys saved: public_key.pem, private_key.pem');
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}

