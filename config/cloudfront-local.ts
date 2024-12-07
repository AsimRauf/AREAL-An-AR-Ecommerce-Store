import { getSignedUrl } from '@aws-sdk/cloudfront-signer';
export const getLocalSignedUrl = (key: string) => {
  return getSignedUrl({
    url: `${process.env.CLOUDFRONT_URL}/${key}`,
    keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
    privateKey: process.env.CLOUDFRONT_PRIVATE_KEY!,
    dateLessThan: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
  });
};
