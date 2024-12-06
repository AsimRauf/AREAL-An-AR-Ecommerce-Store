import { createContext, useContext, useState } from 'react'

interface SidebarContextType {
  showMobileSidebar: boolean
  showDesktopSidebar: boolean
  toggleMobileSidebar: () => void
  toggleDesktopSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [showDesktopSidebar, setShowDesktopSidebar] = useState(true)

  const toggleMobileSidebar = () => setShowMobileSidebar(prev => !prev)
  const toggleDesktopSidebar = () => setShowDesktopSidebar(prev => !prev)

  return (
    <SidebarContext.Provider value={{
      showMobileSidebar,
      showDesktopSidebar,
      toggleMobileSidebar,
      toggleDesktopSidebar
    }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
