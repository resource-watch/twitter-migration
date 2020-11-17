class UnprocessableEntityError extends Error {
    private status: number;

    constructor(message) {
        super(message);
        this.name = 'UnprocessableEntity';
        this.message = message;
        this.status = 422;
    }

}

export default UnprocessableEntityError;
