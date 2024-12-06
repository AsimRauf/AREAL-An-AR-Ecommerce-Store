import type { NextApiRequest, NextApiResponse } from 'next'
import { getSignedUrl } from '@aws-sdk/cloudfront-signer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {    try {
      const fullUrl = req.query.key as string
      const key = fullUrl.includes('/products/') ? 
        fullUrl.split('/products/')[1].split('?')[0] :
        fullUrl.split('/models/')[1].split('?')[0]
      
      const signedUrl = getSignedUrl({
        url: `${process.env.CLOUDFRONT_URL}/${key}`,
        keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
        privateKey: process.env.CLOUDFRONT_PRIVATE_KEY!,
        dateLessThan: new Date(Date.now() + 3600 * 1000)
      })
      
      res.setHeader('Cache-Control', 'public, max-age=3600')
      res.status(200).json({ url: signedUrl })
    } catch (error) {
      console.error('URL refresh error:', error)
      res.status(500).json({ error: 'Failed to refresh URL' })
    }
  }
  