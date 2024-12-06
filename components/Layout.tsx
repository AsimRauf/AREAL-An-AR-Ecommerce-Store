import { useSidebar } from '@/context/SidebarContext'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { showDesktopSidebar } = useSidebar()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`transition-all duration-300 ${showDesktopSidebar ? 'lg:ml-64' : 'ml-0'}`}>
        {children}
      </div>
    </div>
  )
}