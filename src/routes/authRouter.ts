import { Router } from 'express';
import { loginValidation, registerValidation } from '../validations/authValidations.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { authController } from '../controller/authController.js';
import protect from '../middlewares/authMiddleware.js';
import { loginRateLimiter } from '../middlewares/rateLimiter.js';

export function authRouter(router: Router) {
    router.post(
        '/register',
        registerValidation,
        validateRequest,
        authController.register
    );

    router.post(
        '/login',
        loginRateLimiter,
        loginValidation,
        validateRequest,
        authController.login
    );
    router.get('/refresh', authController.refreshToken);
    router.get('/me', protect.protectUser, authController.getCurrentUser);

    return router;
}
