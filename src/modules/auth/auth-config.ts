export default () => ({
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtActionSecret: process.env.JWT_ACTION_SECRET,
  jwtExpiration: process.env.JWT_EXPIRATION,
  jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION,
});
