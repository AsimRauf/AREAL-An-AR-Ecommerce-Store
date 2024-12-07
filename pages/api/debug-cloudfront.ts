import { NextApiRequest, NextApiResponse } from 'next'
import { getSignedUrl } from '@aws-sdk/cloudfront-signer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const testKey = 'products/674810230805b28a42056803/test.jpg';
    
    // Format private key properly
    const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY!
      .replace(/\\n/g, '\n')
      .replace(/^"|"$/g, '')
      .replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n')
      .replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----');

    const signedUrl = getSignedUrl({
      url: `${process.env.CLOUDFRONT_URL}/${testKey}`,
      keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
      privateKey,
      dateLessThan: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });

    res.status(200).json({ signedUrl });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
