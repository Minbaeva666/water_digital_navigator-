import { ApiError } from './ApiError';

export class BadRequestError extends ApiError {
    constructor(message = 'Bad request') {
        super(400, message);
    }
}