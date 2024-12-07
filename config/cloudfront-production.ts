import { getSignedUrl } from '@aws-sdk/cloudfront-signer'

export const getProductionSignedUrl = (key: string) => {
  try {
    // Skip if no key provided
    if (!key) {
      console.log('No key provided');
      return null;
    }

    // Clean the key and log for debugging
    const cleanKey = key.replace(/^https?:\/\/[^\/]+\//, '');
    console.log('Processing key:', cleanKey);

    // Format private key
    const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY!
      .replace(/\\n/g, '\n')
      .replace(/^"|"$/g, '')
      .replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n')
      .replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----');

    // Log environment variables (without sensitive data)
    console.log('Environment check:', {
      hasCloudFrontUrl: !!process.env.CLOUDFRONT_URL,
      hasKeyPairId: !!process.env.CLOUDFRONT_KEY_PAIR_ID,
      hasPrivateKey: !!process.env.CLOUDFRONT_PRIVATE_KEY
    });

    const signedUrl = getSignedUrl({
      url: `${process.env.CLOUDFRONT_URL}/${cleanKey}`,
      keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
      privateKey,
      dateLessThan: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });

    console.log('Generated URL for:', cleanKey);
    return signedUrl;

  } catch (error) {
    console.error('URL signing error for key:', key, error);
    return null;
  }
};
