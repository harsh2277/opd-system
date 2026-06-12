import crypto from 'crypto';

const SECRET_KEY = process.env.JWT_SECRET || 'opd-system-super-secret-key-12345';

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

export function generateToken(payload: object): string {
  const data = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 })).toString('base64');
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('base64');
  return `${data}.${signature}`;
}

export function verifyToken(token: string): any {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;
    
    const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('base64');
    if (signature !== expectedSignature) return null;
    
    const payload = JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
    if (Date.now() > payload.exp) {
      return null; // Token expired
    }
    
    return payload;
  } catch {
    return null;
  }
}
