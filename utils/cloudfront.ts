export const formatPrivateKey = (privateKey: string) => {
  // Convert PEM string to proper format
  const pemHeader = '-----BEGIN PRIVATE KEY-----\n';
  const pemFooter = '\n-----END PRIVATE KEY-----';
  
  // Remove existing headers/footers and whitespace
  const keyContent = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');
    
  // Add proper PEM formatting
  return `${pemHeader}${keyContent}${pemFooter}`;
};
