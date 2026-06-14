/**
 * Validation Middleware Factory
 * Uses Zod for schema validation
 */
const { z } = require('zod');

/**
 * Create validation middleware for request body
 */
const validateBody = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Create validation middleware for URL params
 */
const validateParams = (schema) => (req, res, next) => {
    try {
        req.params = schema.parse(req.params);
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Create validation middleware for query params
 */
const validateQuery = (schema) => (req, res, next) => {
    try {
        req.query = schema.parse(req.query);
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Common schemas
 */
const uuidSchema = z.string().uuid('Invalid UUID format');

const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = {
    validateBody,
    validateParams,
    validateQuery,
    uuidSchema,
    paginationSchema,
};
