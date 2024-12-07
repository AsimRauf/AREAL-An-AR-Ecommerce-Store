export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Use an actual image key from your database
    const testKey = 'products/674810230805b28a42056803/test.jpg';
    
    // Log the private key format
    const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY!
      .replace(/\\n/g, '\n')
      .replace(/"([^"]+)"/, '$1');
    
    console.log('Private key first line:', privateKey.split('\n')[1]);
  
    const result = {
      originalKey: testKey,
      signedUrl: await generateSignedUrl(testKey),
      cloudFrontUrl: process.env.CLOUDFRONT_URL,
      keyPairIdPrefix: process.env.CLOUDFRONT_KEY_PAIR_ID?.substring(0, 4),
      privateKeyLength: privateKey.length
    };
    
    res.status(200).json(result);
  }