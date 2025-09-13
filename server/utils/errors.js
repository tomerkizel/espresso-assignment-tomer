class InvalidParameterError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidParameterError';
        this.statusCode = 400;
        this.message = message;
    }
}

export { InvalidParameterError };