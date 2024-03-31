export interface LoginResponse {
    type: 'bearer',
    value: string,
    expiresAt: string | null
}