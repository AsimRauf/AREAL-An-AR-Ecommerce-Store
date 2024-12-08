import { FiGithub, FiHeart, FiLinkedin, FiMail, FiPhone, FiMapPin, FiShoppingBag } from 'react-icons/fi'
import { HiHeart } from 'react-icons/hi'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">AREAL</h3>
            <p className="text-sm text-gray-400">
              Experience the future of shopping with our AR-powered marketplace
            </p>
            <div className="flex space-x-4">
              <Link 
                href="https://github.com/AsimRauf"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                <FiGithub className="w-5 h-5" />
              </Link>
              <Link 
                href="https://www.linkedin.com/in/asim-rauf-43111223b/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                <FiLinkedin className="w-5 h-5" />
              </Link>
            </div>
          </div>
            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/products" className="hover:text-white transition-colors">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="hover:text-white transition-colors">
                    Categories
                  </Link>
                </li>
                <li>
                  <Link href="/ar-guide" className="hover:text-white transition-colors">
                    AR Shopping Guide
                  </Link>
                </li>
              </ul>
            </div>

            {/* Sell With Us - New prominent section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Sell With Us</h3>
              <p className="text-gray-300 mb-4">Transform your business with AR-powered selling</p>
              <Link 
                href="/seller/auth/signup" 
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-white hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-lg"
              >
                <FiShoppingBag className="mr-2" />
                Start Selling
              </Link>
            </div>
          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition-colors">
                  Returns Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FiMail className="w-5 h-5 text-indigo-400" />
                <a href="mailto:asimraoofbuzz@gmail.com" className="hover:text-white transition-colors">
                  asimraoofbuzz@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <FiPhone className="w-5 h-5 text-indigo-400" />
                <a href="tel:+1234567890" className="hover:text-white transition-colors">
                  +92-(341)3528382
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <FiMapPin className="w-5 h-5 text-indigo-400" />
                <span>Sadiqabad, Pakistan</span>
              </div>
            </div>
          </div>
        </div>
        {/* Made with love section */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2 text-lg">
              <span className="text-indigo-200">
                Crafted with
              </span>
              <HiHeart className="w-5 h-5 text-pink-400 animate-pulse" />
              <span className="text-indigo-200">
                by
              </span>
              <span className="text-purple-300 hover:text-purple-200 transition-colors">
                Asim Rauf
              </span>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-1">
              <Link 
                href="https://github.com/AsimRauf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-300 hover:text-white transform hover:scale-110 transition-all duration-300"
              >
                <FiGithub className="w-5 h-5" />
              </Link>
              <Link 
                href="https://www.linkedin.com/in/asim-rauf-43111223b/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-300 hover:text-white transform hover:scale-110 transition-all duration-300"
              >
                <FiLinkedin className="w-5 h-5" />
              </Link>
            </div>

            {/* Copyright */}
            <div className="text-sm text-indigo-200">
              © {new Date().getFullYear()} AREAL. All rights reserved
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}