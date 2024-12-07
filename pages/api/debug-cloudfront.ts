import { NextApiRequest, NextApiResponse } from 'next'
import { getSignedUrl } from '@aws-sdk/cloudfront-signer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const testKey = 'products/674810230805b28a42056803/test.jpg';
    
    // Format private key
    const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY!
      .replace(/\\n/g, '\n')
      .replace(/"([^"]+)"/, '$1');

    console.log('Environment:', {
      nodeEnv: process.env.NODE_ENV,
      cloudFrontUrl: process.env.CLOUDFRONT_URL,
      keyPairIdLength: process.env.CLOUDFRONT_KEY_PAIR_ID?.length,
      privateKeyLength: privateKey.length,
    });

    const signedUrl = getSignedUrl({
      url: `${process.env.CLOUDFRONT_URL}/${testKey}`,
      keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
      privateKey,
      dateLessThan: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });

    res.status(200).json({
      originalKey: testKey,
      signedUrl,
      env: {
        hasCloudFrontUrl: !!process.env.CLOUDFRONT_URL,
        hasKeyPairId: !!process.env.CLOUDFRONT_KEY_PAIR_ID,
        hasPrivateKey: !!process.env.CLOUDFRONT_PRIVATE_KEY?.length,
        privateKeyFirstLine: privateKey.split('\n')[1]?.substring(0, 10) // First 10 chars for verification
      }
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error as Error)?.stack : undefined
    });
  }
}
