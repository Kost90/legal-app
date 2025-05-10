export default () => ({
  region: process.env.AWS_REGION,
  name: process.env.AWS_S3_BUCKET,
  key: process.env.AWS_ACCESS_KEY,
  secret: process.env.AWS_SECRET_ACCESS_KEY,
});
