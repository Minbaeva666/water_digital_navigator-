export class EmailError extends Error {
    constructor(message: string = 'Failed to send email.') {
        super(message);
        this.name = 'EmailError';
    }
}