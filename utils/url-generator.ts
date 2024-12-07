import { getProductionSignedUrl } from '../config/cloudfront-production';
import { getLocalSignedUrl } from '../config/cloudfront-local';

export const getEnvironmentSignedUrl = (key: string) => {
  // Add null check and URL cleaning
  if (!key) return null;
  
  // Clean the URL if it's a full S3/CloudFront URL
  const cleanKey = key.replace(/^https?:\/\/[^\/]+\//, '');
  
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? getProductionSignedUrl(cleanKey) : getLocalSignedUrl(cleanKey);
};
