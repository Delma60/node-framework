export class HttpException extends Error {
    public status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
        
        // Ensure the name of the error matches the class name (e.g., "NotFoundException")
        this.name = this.constructor.name;
        
        // Capture the correct stack trace (Node.js specific)
        Error.captureStackTrace(this, this.constructor);
    }
}