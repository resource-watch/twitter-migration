class ErrorSerializer {

    static serializeValidationError(data: Record<string, unknown>, typeParam: string): Record<string, unknown> {
        const keys = Object.keys(data);
        let message;
        switch (typeParam) {

            case 'body':
                message = 'Invalid body parameter';
                break;
            case 'query':
                message = 'Invalid query parameter';
                break;
            default:
                message = '';

        }
        return {
            source: {
                parameter: keys[0]
            },
            code: message.replace(/ /g, '_').toLowerCase(),
            title: message,
            detail: data[keys[0]]
        };
    }

    static serializeValidationBodyErrors(data: Array<Record<string, unknown>>): Record<string, Array<Record<string, unknown>>> {
        const errors = [];
        if (data) {
            for (let i = 0, { length } = data; i < length; i++) {
                errors.push(ErrorSerializer.serializeValidationError(data[i], 'body'));
            }
        }
        return {
            errors
        };
    }

    static serializeError(status: number, message: string): Record<string, Array<Record<string, unknown>>> {
        return {
            errors: [{
                status,
                detail: message
            }]
        };
    }

}

export default ErrorSerializer;
