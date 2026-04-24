import QRCode from 'qrcode';
import * as OTPAuth from 'otpauth';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ACCOUNTS_PATH = path.join(__dirname, '..', 'data', 'accounts.json');


function _loadAccounts() {
    try {
        return JSON.parse(fs.readFileSync(ACCOUNTS_PATH, 'utf-8'));
    } catch (e) {
        return {};
    }
}

function _saveAccounts(accounts) {
    fs.writeFileSync(ACCOUNTS_PATH, JSON.stringify(accounts, null, 2));
}

function _buildTotp(email, secret) {
    return new OTPAuth.TOTP({
        issuer: 'Alkimia',
        label: email,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret)
    });
}


export async function handleAuth(req, res, pathname, body, json) {

    if (pathname === '/api/auth/login' && req.method === 'POST') {

        if (!body || !body.email || !body.password) {
            return json(res, 400, { error: 'email and password required' });
        }

        const accounts = _loadAccounts();
        const account = accounts[body.email];

        if (!account || account.password !== body.password) {
            return json(res, 401, { error: 'invalid credentials' });
        }

        return json(res, 200, {
            token: 'mock-jwt-token-' + Date.now(),
            user: { email: body.email, name: account.name },
            requires2FA: !!account.totpSecret
        });
    }


    if (pathname === '/api/auth/register' && req.method === 'POST') {

        if (!body || !body.email || !body.password) {
            return json(res, 400, { error: 'email and password required' });
        }

        const accounts = _loadAccounts();

        if (accounts[body.email]) {
            return json(res, 409, { error: 'account already exists' });
        }

        const secret = new OTPAuth.Secret({ size: 20 }).base32;

        const totp = _buildTotp(body.email, secret);
        const totpUri = totp.toString();
        const qrSvg = await QRCode.toString(totpUri, { type: 'svg' });

        accounts[body.email] = {
            name: body.email.split('@')[0],
            password: body.password,
            totpSecret: secret
        };
        _saveAccounts(accounts);

        return json(res, 200, {
            token: 'mock-jwt-registered-' + Date.now(),
            user: { email: body.email, name: accounts[body.email].name },
            setup2FA: true,
            totpSecret: secret,
            totpUri: totpUri,
            qrCode: qrSvg
        });
    }


    if (pathname === '/api/auth/verify-2fa' && req.method === 'POST') {

        if (!body || !body.code || !body.email) {
            return json(res, 400, { error: 'code and email required' });
        }

        const accounts = _loadAccounts();
        const account = accounts[body.email];

        if (!account || !account.totpSecret) {
            return json(res, 400, { error: 'no 2FA configured for this account' });
        }

        const totp = _buildTotp(body.email, account.totpSecret);
        const delta = totp.validate({ token: body.code, window: 1 });

        if (delta !== null) {
            return json(res, 200, {
                token: 'mock-jwt-verified-' + Date.now(),
                user: { email: body.email, name: account.name, verified: true }
            });
        }

        return json(res, 401, { error: 'invalid code' });
    }

    return json(res, 404, { error: 'auth endpoint not found' });
}
