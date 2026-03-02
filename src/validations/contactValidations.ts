
import { body, param, query } from 'express-validator';
import { STATUS_VALUES } from '../constants/contact.js';

export const contactIdParamValidation = [
    param('id').isMongoId().withMessage('Invalid contact id'),
];

export const createContactValidations = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email')
        .isEmail().withMessage('Valid email is required'),
    body('phone')
        .notEmpty().withMessage('Phone number is required')
        .matches(/^\+?[0-9\-\s]{7,20}$/).withMessage('Phone number is invalid'),
    body('company')
        .notEmpty().withMessage('Company is required')
        .isLength({ min: 2, max: 100 }).withMessage('Company must be 2-100 characters'),
    body('status')
        .isIn(STATUS_VALUES).withMessage(`Status must be one of: ${STATUS_VALUES.join(', ')}`),
    body('notes')
        .optional()
        .isString().withMessage('Notes must be a string'),
];

export const getContactsQueryValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('page must be a positive integer')
        .toInt(),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100')
        .toInt(),
    query('search')
        .optional()
        .isString().withMessage('search must be a string')
        .trim(),
    query('status')
        .optional()
        .isIn(STATUS_VALUES).withMessage(`status must be one of: ${STATUS_VALUES.join(', ')}`),
];

export const editContactValidations = [
    body('name')
        .optional()
        .notEmpty().withMessage('Name cannot be empty')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email')
        .optional()
        .isEmail().withMessage('Valid email is required'),
    body('phone')
        .optional()
        .matches(/^\+?[0-9\-\s]{7,20}$/).withMessage('Phone number is invalid'),
    body('company')
        .optional()
        .notEmpty().withMessage('Company cannot be empty')
        .isLength({ min: 2, max: 100 }).withMessage('Company must be 2-100 characters'),
    body('status')
        .optional()
        .isIn(STATUS_VALUES).withMessage(`Status must be one of: ${STATUS_VALUES.join(', ')}`),
    body('notes')
        .optional()
        .isString().withMessage('Notes must be a string'),
];
