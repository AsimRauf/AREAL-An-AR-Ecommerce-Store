import { NextApiRequest, NextApiResponse } from 'next'
import { getSignedUrl } from '@aws-sdk/cloudfront-signer'

// Local signing function for testing
const generateSignedUrl = (key: string) => {
  try {
    const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY!
      .replace(/\\n/g, '\n')
      .replace(/"([^"]+)"/, '$1');

    return getSignedUrl({
      url: `${process.env.CLOUDFRONT_URL}/${key}`,
      keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
      privateKey,
      dateLessThan: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });
  } catch (error) {
    console.error('URL signing error:', error);
    return null;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const testKey = 'products/674810230805b28a42056803/test.jpg';
    
    const result = {
      originalKey: testKey,
      signedUrl: generateSignedUrl(testKey),
      env: {
        hasCloudFrontUrl: !!process.env.CLOUDFRONT_URL,
        hasKeyPairId: !!process.env.CLOUDFRONT_KEY_PAIR_ID,
        hasPrivateKey: !!process.env.CLOUDFRONT_PRIVATE_KEY?.length
      }
    };
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
}
