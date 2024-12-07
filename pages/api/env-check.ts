export default function handler(req, res) {
  res.json({
    hasAccessKey: !!process.env.ACCESS_KEY_ID,
    hasSecretKey: !!process.env.SECRET_ACCESS_KEY,
    hasRegion: !!process.env.REGION,
    hasBucketName: !!process.env.BUCKET_NAME,
    hasMongoDbUri: !!process.env.MONGODB_URI,
  })
}