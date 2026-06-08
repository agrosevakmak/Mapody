export async function uploadToS3(
  _base64Data: string,
  _key: string,
  _contentType: string
): Promise<string | null> {
  const endpoint = process.env.S3_ENDPOINT;
  const accessKey = process.env.S3_ACCESS_KEY;
  const secretKey = process.env.S3_SECRET_KEY;

  if (!endpoint || !accessKey || !secretKey) return null;

  console.warn(
    "S3 upload requires @aws-sdk/client-s3. Install it with: npm install @aws-sdk/client-s3"
  );
  return null;
}
