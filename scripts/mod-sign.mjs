#!/usr/bin/env node
/**
 * Mod 簽章 CLI（與 src/mod-script/signing.ts 同一套 canonicalize 規則）
 *
 * 用法：
 *   node scripts/mod-sign.mjs keygen --out key.json
 *   node scripts/mod-sign.mjs sign   --key key.json --in mod.json --out mod.signed.json
 *   node scripts/mod-sign.mjs verify --in mod.signed.json
 *
 * 注意：canonicalize 必須與前端完全一致（鍵排序、略過 signature），
 * 否則前端驗簽永遠失敗。改這裡就要同步改 signing.ts。
 */
import fs from 'node:fs';
import crypto from 'node:crypto';

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value !== null && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).sort()) {
      if (key === 'signature') continue;
      out[key] = sortValue(value[key]);
    }
    return out;
  }
  return value;
}

function canonicalize(mod) {
  return JSON.stringify(sortValue(mod));
}

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  fs.writeFileSync(path, JSON.stringify(value, null, 2), 'utf8');
}

function keygen(outPath) {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const spkiB64 = publicKey.export({ type: 'spki', format: 'der' }).toString('base64');
  writeJson(outPath, {
    alg: 'ECDSA-P256-SHA256',
    publicKeySpkiB64: spkiB64,
    privateKeyPkcs8Pem: privateKey.export({ type: 'pkcs8', format: 'pem' }),
  });
  console.log(`金鑰已寫入 ${outPath}`);
  console.log('公鑰（夾帶在用來驗簽的簽章裡）：');
  console.log(spkiB64);
}

function sign(keyPath, inPath, outPath) {
  const keyFile = readJson(keyPath);
  const mod = readJson(inPath);
  const privateKey = crypto.createPrivateKey(keyFile.privateKeyPkcs8Pem);
  const data = Buffer.from(canonicalize(mod), 'utf8');
  // ieee-p1363 才是 WebCrypto 認得的 r||s 格式；Node 預設 DER 會驗不過
  const signature = crypto.sign('sha256', data, { key: privateKey, dsaEncoding: 'ieee-p1363' });
  writeJson(outPath, {
    ...mod,
    signature: {
      alg: 'ECDSA-P256-SHA256',
      publicKeySpkiB64: keyFile.publicKeySpkiB64,
      valueB64: signature.toString('base64'),
    },
  });
  console.log(`已簽章並寫入 ${outPath}`);
}

function verify(inPath) {
  const mod = readJson(inPath);
  if (!mod.signature) {
    console.log('未簽章');
    process.exitCode = 1;
    return;
  }
  const publicKey = crypto.createPublicKey({
    key: Buffer.from(mod.signature.publicKeySpkiB64, 'base64'),
    format: 'der',
    type: 'spki',
  });
  const ok = crypto.verify(
    'sha256',
    Buffer.from(canonicalize(mod), 'utf8'),
    { key: publicKey, dsaEncoding: 'ieee-p1363' },
    Buffer.from(mod.signature.valueB64, 'base64'),
  );
  const fingerprint = crypto
    .createHash('sha256')
    .update(Buffer.from(mod.signature.publicKeySpkiB64, 'base64'))
    .digest('hex')
    .slice(0, 16);
  console.log(ok ? `簽章有效（指紋 ${fingerprint}）` : '簽章無效');
  process.exitCode = ok ? 0 : 1;
}

const [command, ...rest] = process.argv.slice(2);
const flags = new Map();
for (let i = 0; i < rest.length; i += 2) {
  if (rest[i]?.startsWith('--')) flags.set(rest[i].slice(2), rest[i + 1]);
}

if (command === 'keygen' && flags.get('out')) keygen(flags.get('out'));
else if (command === 'sign' && flags.get('key') && flags.get('in') && flags.get('out')) {
  sign(flags.get('key'), flags.get('in'), flags.get('out'));
} else if (command === 'verify' && flags.get('in')) verify(flags.get('in'));
else {
  console.error('用法：keygen --out key.json | sign --key key.json --in mod.json --out mod.signed.json | verify --in mod.signed.json');
  process.exitCode = 1;
}
