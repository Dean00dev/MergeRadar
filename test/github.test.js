import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createAppJwt } from '../src/github.js';

test('GitHub App JWT is RS256-signed and contains bounded lifetime', () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const now = Date.UTC(2026, 7, 17, 12, 0, 0);
  const token = createAppJwt({
    appId: '12345',
    privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }),
    now
  });

  const [header, payload, signature] = token.split('.');
  const decodedHeader = JSON.parse(Buffer.from(header, 'base64url').toString('utf8'));
  const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));

  assert.equal(decodedHeader.alg, 'RS256');
  assert.equal(decodedPayload.iss, '12345');
  assert.equal(decodedPayload.exp - decodedPayload.iat, 540);
  assert.equal(
    crypto.verify(
      'RSA-SHA256',
      Buffer.from(`${header}.${payload}`),
      publicKey,
      Buffer.from(signature, 'base64url')
    ),
    true
  );
});
