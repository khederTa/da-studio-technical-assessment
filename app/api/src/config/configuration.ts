export default () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    uri: process.env.MONGO_URI,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '900000', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '5', 10),
  },
});