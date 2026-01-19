/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AiChatService {
    /**
     * Chat with the AI Assistant
     * Sends a user message to the Hugging Face AI and returns a travel-related response.
     * @param requestBody
     * @returns any Successful AI response
     * @throws ApiError
     */
    public static postApiAiChat(
        requestBody: {
            message: string;
        },
    ): CancelablePromise<{
        reply?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/ai/chat',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request – Invalid inputs (e.g., date format or missing ID).`,
                500: `Internal server error – unexpected condition on the server.`,
            },
        });
    }
}
