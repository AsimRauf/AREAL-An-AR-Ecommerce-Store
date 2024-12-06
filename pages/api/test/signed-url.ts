import { NextApiRequest, NextApiResponse } from 'next'
import { getSignedUrl } from '@aws-sdk/cloudfront-signer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const imageKey = 'products/674810230805b28a42056803/1732787451539-1732630994079-ha@gmial.com (1).jpg'
    
    const signedUrl = getSignedUrl({
      url: `${process.env.CLOUDFRONT_URL}/${imageKey}`,
      keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
      privateKey: process.env.CLOUDFRONT_PRIVATE_KEY!,
      dateLessThan: new Date(Date.now() + 60 * 60 * 1000)
    })

    res.status(200).json({ signedUrl })
  } catch (error) {
    console.error('Signed URL generation error:', error)
    res.status(500).json({ error: 'Failed to generate signed URL' })
  }
}
