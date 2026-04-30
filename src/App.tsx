/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ShoppingBag, LayoutDashboard, Coffee, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import AdminOrders from './pages/AdminOrders';
import AdminMenu from './pages/AdminMenu';
import { cn } from './lib/utils';

function Navbar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-orange-600">
          <Coffee className="h-6 w-6" />
          <span>茶飲點單系統</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {!isAdmin ? (
            <>
              <Link to="/" className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                location.pathname === "/" ? "bg-orange-100 text-orange-700" : "text-gray-600 hover:text-orange-600"
              )}>
                菜單
              </Link>
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-orange-600">
                <ShoppingBag className="h-6 w-6" />
                {/* Cart badge would go here */}
              </Link>
              <Link to="/admin" className="ml-4 flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
                <LayoutDashboard className="h-4 w-4" />
                後台管理
              </Link>
            </>
          ) : (
            <>
              <Link to="/admin" className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                location.pathname === "/admin" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-blue-600"
              )}>
                訂單處理
              </Link>
              <Link to="/admin/menu" className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                location.pathname === "/admin/menu" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-blue-600"
              )}>
                菜單管理
              </Link>
              <Link to="/" className="ml-4 flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
                <Coffee className="h-4 w-4" />
                回到前台
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

import { CartProvider } from './context/CartContext';

export default function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Menu />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/admin" element={<AdminOrders />} />
                <Route path="/admin/menu" element={<AdminMenu />} />
              </Routes>
            </AnimatePresence>
          </main>
          <footer className="border-t bg-white py-8 text-center text-gray-500">
            <div className="mx-auto max-w-7xl px-4">
              <p className="text-sm">© 2024 茶飲點單系統. Powered by Firebase.</p>
            </div>
          </footer>
        </div>
      </Router>
    </CartProvider>
  );
}
