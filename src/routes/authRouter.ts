import { Router } from 'express';
import { loginValidation, registerValidation } from '../validations/authValidations.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { authController } from '../controller/authController.js';


export function authRouter(router: Router) {
    router.post(
        '/register',
        registerValidation,
        validateRequest,
        authController.register
    );

    router.post(
        '/login',
        loginValidation,
        validateRequest,
        authController.login
    );
    router.get('/refresh', authController.refreshToken);

    return router;
}
