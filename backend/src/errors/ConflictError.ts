import { ApiError } from './ApiError';

export class ConflictError extends ApiError {
    constructor(message = 'Conflict – value already exists') {
        super(409, message);
    }
}