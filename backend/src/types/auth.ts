export interface SignupRequest {
    name: string;
    email: string;
    password: string;
    phone: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    token: string;
    user?: {
        user_id: number;
        name: string;
        email: string;
        role: string;
    }
}