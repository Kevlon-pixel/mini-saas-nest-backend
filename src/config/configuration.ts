export default () => ({
  port: parseInt(process.env.PORT!, 10) || 3000,
  salt: Number(process.env.SALT),
  database: {
    url: process.env.DATABASE_URL_HOST,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT!, 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
