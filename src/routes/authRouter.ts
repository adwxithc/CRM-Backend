import { Router } from 'express';
import { registerValidation } from '../validations/authValidations.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { authController } from '../controller/authController.js';


export function authRouter(router: Router) {
    router.post(
        '/register',
        registerValidation,
        validateRequest,
        authController.register
    );

    return router;
}
