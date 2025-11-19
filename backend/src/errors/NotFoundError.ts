import { ApiError } from './ApiError';

export class NotFoundError extends ApiError {
    constructor(resource = 'Resource') {
        super(404, `${resource} not found`);
    }
}