import SellerNavbar from '../seller/SellerNavbar'

export default function SellerLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900">
      <SellerNavbar />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
