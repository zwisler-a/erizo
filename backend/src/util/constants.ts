
export const jwtSecret = `${Math.random().toString(36).substring(7) + crypto.randomUUID()}`;
