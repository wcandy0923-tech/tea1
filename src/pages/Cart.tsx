import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, ChevronLeft, CreditCard, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';

export default function Cart() {
  const { items, removeFromCart, totalPrice, clearCart } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmitOrder = async () => {
    if (!customerName) {
      alert('請輸入取餐人姓名');
      return;
    }
    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'orders'), {
        customerName,
        items,
        totalPrice,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      clearCart();
      alert('訂單已送出！請稍候製作。');
      navigate('/');
    } catch (error) {
      console.error("Order failed", error);
      alert('訂單送出失敗，請檢查網路連線。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-black tracking-tight text-gray-900">購物車</h1>
        <Link to="/" className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-gray-600">
          <ChevronLeft className="h-4 w-4" />
          繼續點餐
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <AnimatePresence mode="popLayout">
            {items.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100"
              >
                <div className="mx-auto h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                   <Trash2 className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-gray-400">目前沒有選擇任何品項</p>
                <Link to="/" className="mt-4 inline-block text-orange-600 font-bold">快去逛逛吧！</Link>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <motion.div
                    key={`${item.productId}-${index}`}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-50"
                  >
                    <div className="h-20 w-20 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1544787210-2213d24293f0?q=80&w=200&auto=format&fit=crop" 
                        alt="" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{item.sugar} · {item.ice}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-400">x {item.quantity}</span>
                        <span className="font-bold text-orange-600">${item.price * item.quantity}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(index)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-24 bg-white p-6 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gray-400" />
              訂單結帳
            </h3>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">取餐人姓名</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="請輸入姓名"
                  className="mt-2 w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-orange-600 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2 py-4 border-t border-gray-50 mb-6">
              <div className="flex justify-between text-gray-500 text-sm">
                <span>小計</span>
                <span>${totalPrice}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-sm">
                <span>服務費</span>
                <span>$0</span>
              </div>
              <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                <span className="text-xl font-black">總計</span>
                <span className="text-2xl font-black text-orange-600">${totalPrice}</span>
              </div>
            </div>

            <button
              disabled={items.length === 0 || isSubmitting}
              onClick={handleSubmitOrder}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-lg font-bold transition-all shadow-lg active:scale-95",
                items.length === 0 || isSubmitting
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-orange-600 text-white shadow-orange-100 hover:bg-orange-700 hover:shadow-orange-200"
              )}
            >
              <Send className="h-5 w-5" />
              {isSubmitting ? '送出中...' : '送出訂單'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
