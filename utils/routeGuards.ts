export const isSellerRoute = (pathname: string) => {
  return pathname.startsWith('/seller')
}

export const isBuyerRoute = (pathname: string) => {
  return !pathname.startsWith('/seller') && !pathname.startsWith('/auth/seller')
}
