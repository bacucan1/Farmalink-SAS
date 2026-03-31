import bcrypt from 'bcrypt';
const SALT_ROUNDS = 10;
export async function hashPassword(plain) {
    return bcrypt.hash(plain, SALT_ROUNDS);
}
/** Acepta hash bcrypt o contraseña en texto plano legada (migración). */
export async function verifyPassword(plain, stored) {
    if (stored == null || stored === '')
        return false;
    if (stored.startsWith('$2a$') || stored.startsWith('$2b$')) {
        return bcrypt.compare(plain, stored);
    }
    return plain === stored;
}
//# sourceMappingURL=password.js.map