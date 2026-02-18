import { ApiError } from './ApiError';

/**
 * Error thrown when deletion is blocked due to referential constraints
 * 
 * HTTP 409 Conflict - indicates the operation violates referential integrity
 */
export class ReferentialIntegrityError extends ApiError {
    constructor(
        message: string = 'Deletion is not possible, this item is already in use.',
        public details?: {
            entityId?: string;
            entityType?: string;
            references?: Record<string, any>;
            suggestion?: string;
        }
    ) {
        super(409, message);
        this.name = 'ReferentialIntegrityError';
    }

    toJSON() {
        return {
            status: this.status,
            error: this.message,
            name: this.name,
            details: this.details || {},
        };
    }
}
