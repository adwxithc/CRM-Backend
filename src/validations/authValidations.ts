import { body } from 'express-validator';
export const registerValidation = [
    body("name").notEmpty().withMessage("name is required"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password")
        .isLength({ min: 6, max: 20 })
        .withMessage(
            "Password must be between 6 and 20 characters long"
        )
        .matches(
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{4,20}$/
        )
        .withMessage(
            "Password must contain at least one letter, one number, and one special character"
        ),
]