import { getSignedUrl } from '@aws-sdk/cloudfront-signer';

export const generateSignedUrl = (key: string) => {
  try {
    // Skip if no key provided
    if (!key) {
      console.log('No key provided');
      return null;
    }

    // Clean the key
    const cleanKey = key.replace(/^https?:\/\/[^\/]+\//, '');
    console.log('Processing key:', cleanKey);

    // Format private key
    const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY!
      .replace(/\\n/g, '\n')
      .replace(/"([^"]+)"/, '$1');

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
