import { CustomError } from "./custom-error.js";

export class TooManyRequestsError extends CustomError {
    statusCode = 429;

    constructor(public message: string = "Too many requests, please try again later") {
        super(message);
        Object.setPrototypeOf(this, TooManyRequestsError.prototype);
    }

    serializeErrors() {
        return [{ message: this.message }];
    }
}
