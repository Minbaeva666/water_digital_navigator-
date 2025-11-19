import { ApiError } from './ApiError';

export class InternalServerError extends ApiError {
    constructor(message = 'Internal server error') {
        super(500, message);
    }
}