import { NextApiRequest, NextApiResponse } from 'next'
import { generateSignedUrl } from '../../utils/cloudfront'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const testKey = 'test-image.jpg';
  
  const result = {
    originalKey: testKey,
    signedUrl: await generateSignedUrl(testKey),
    env: {
      hasCloudFrontUrl: !!process.env.CLOUDFRONT_URL,
      hasKeyPairId: !!process.env.CLOUDFRONT_KEY_PAIR_ID,
      hasPrivateKey: !!process.env.CLOUDFRONT_PRIVATE_KEY?.length
    }
  };
  
  res.status(200).json(result);
}
