export declare function hashPassword(plain: string): Promise<string>;
/** Acepta hash bcrypt o contraseña en texto plano legada (migración). */
export declare function verifyPassword(plain: string, stored: string | null | undefined): Promise<boolean>;
//# sourceMappingURL=password.d.ts.map