import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  PORT: Joi.number().default(3000),
  MONGO_URI: Joi.string().required().description('MongoDB Connection URI'),
  JWT_SECRET: Joi.string().min(32).required().description('JWT Secret Key (Min 32 characters)'),
  JWT_EXPIRES_IN: Joi.string().default('24h'),
  THROTTLE_TTL: Joi.number().default(900000),
  THROTTLE_LIMIT: Joi.number().default(5),
  REDIS_URL: Joi.string().uri().required(),
  CORS_ORIGIN: Joi.string().required(),
});