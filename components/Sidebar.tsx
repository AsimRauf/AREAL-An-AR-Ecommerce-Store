import Link from 'next/link'
import { FiChevronLeft } from 'react-icons/fi'
import { useRouter } from 'next/router'
import { useSidebar } from '../context/SidebarContext'

export default function Sidebar({ isMobile }: { isMobile: boolean }) {
    const { showMobileSidebar, showDesktopSidebar, toggleMobileSidebar, toggleDesktopSidebar } = useSidebar()
    const router = useRouter()
    
    const categories = [
        'Electronics',
        'Fashion',
        'Home & Furniture',
        'Beauty & Personal Care',
        'Sports & Fitness',
        'Books & Stationery',
        'Toys & Games',
        'Automotive',
        'Health & Wellness',
        'Jewelry & Watches',
        'Home Appliances',
        'Garden & Outdoor',
        'Pet Supplies',
        'Art & Crafts',
        'Baby & Kids',
        'Office Supplies',
        'Musical Instruments',
        'Food & Beverages',
        'Tools & Hardware'
    ]

    const sidebarClasses = isMobile
        ? `fixed top-0 left-0 h-screen w-64 transform ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-[999] lg:hidden`
        : `fixed top-0 left-0 h-screen w-64 hidden lg:block transform ${showDesktopSidebar ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-[51]`

    return (
        <>
            <aside className={sidebarClasses}>
                <div className="h-full bg-white border-r shadow-lg pt-16">
                    {!isMobile && (
                        <button
                            onClick={toggleDesktopSidebar}
                            className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white border-2 border-gray-200 rounded-full p-2.5 shadow-lg hover:bg-gray-50 items-center justify-center z-[52] w-8 h-8 flex"
                        >
                            <FiChevronLeft
                                size={24}
                                className={`transform transition-transform duration-300 text-indigo-600 ${showDesktopSidebar ? '' : 'rotate-180'}`}
                            />
                        </button>
                    )}
                        <div className="sidebar-content scrollbar-thin px-4 py-2 h-full overflow-y-auto">
                            <h2 className="text-xl font-bold text-indigo-600 mb-6 px-4">Categories</h2>
                            <ul className="space-y-1">
                                {categories.map((category, index) => (
                                    <li key={index}>
                                        <Link
                                            href={`/category/${category.toLowerCase()}`}
                                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                const path = `/category/${category.toLowerCase()}`
                                                router.push(path).then(() => {
                                                    if (isMobile) {
                                                        toggleMobileSidebar()
                                                    }
                                                })
                                            }}
                                        >
                                            <span className="text-lg">{category}</span>
                                            <span className="ml-auto text-gray-400">→</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <style jsx global>{`
                      /* Custom Scrollbar Styles */
                      .scrollbar-thin {
                        scrollbar-width: thin
                        scrollbar-color: #6366f1 #e0e7ff
                      }

                      .scrollbar-thin::-webkit-scrollbar {
                        width: 6px
                      }

                      .scrollbar-thin::-webkit-scrollbar-track {
                        background: #e0e7ff
                        border-radius: 8px
                      }

                      .scrollbar-thin::-webkit-scrollbar-thumb {
                        background: #6366f1
                        border-radius: 8px
                        transition: all 0.3s ease
                      }

                      .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                        background: #4f46e5
                      }

                      /* Add this class to your sidebar's scrollable div */
                      .sidebar-content {
                        height: calc(100vh - 4rem)
                        overflow-y: auto
                        padding-right: 4px; /* Prevent content shift */
                      }
                    `}</style>
            </aside>

            {isMobile && showMobileSidebar && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-[998] lg:hidden"
                    onClick={toggleMobileSidebar}
                />
            )}
        </>
    )
}
