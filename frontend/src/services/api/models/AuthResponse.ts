/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AuthResponse = {
    success?: boolean;
    message?: string;
    /**
     * The JWT Token to use for future requests
     */
    token?: string;
    user?: {
        user_id?: number;
        name?: string;
        email?: string;
    };
};

