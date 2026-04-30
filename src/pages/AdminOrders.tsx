import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, OrderStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, CheckCircle, XCircle, PlayCircle, Database } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ordersData);
      setLoading(loading && false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  const seedData = async () => {
    const batch = writeBatch(db);
    
    // Categories
    const catRefs = [
      doc(collection(db, 'categories'), 'cat1'),
      doc(collection(db, 'categories'), 'cat2'),
      doc(collection(db, 'categories'), 'cat3'),
    ];
    
    batch.set(catRefs[0], { name: '醇茶系列', order: 1 });
    batch.set(catRefs[1], { name: '拿鐵系列', order: 2 });
    batch.set(catRefs[2], { name: '手作調飲', order: 3 });

    // Products
    const products = [
      { id: 'p1', name: '一把青茶', price: 35, categoryId: 'cat1', description: '嚴選茶葉，清爽回甘。', imageUrl: 'https://images.unsplash.com/photo-1544787210-2213d24293f0?q=80&w=600&auto=format&fit=crop' },
      { id: 'p2', name: '茉莉香片', price: 35, categoryId: 'cat1', description: '芬芳茉莉，清新怡人。', imageUrl: 'https://images.unsplash.com/photo-1582793988951-9aed5509eb97?q=80&w=600&auto=format&fit=crop' },
      { id: 'p3', name: '錫蘭紅茶拿鐵', price: 55, categoryId: 'cat2', description: '香濃厚茶與鮮奶完美融合。', imageUrl: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?q=80&w=600&auto=format&fit=crop' },
      { id: 'p4', name: '珍珠奶茶', price: 50, categoryId: 'cat3', description: '經典手作，珍珠Ｑ彈。', imageUrl: 'https://images.unsplash.com/photo-1544259509-d7b1349f48ac?q=80&w=600&auto=format&fit=crop' },
    ];

    products.forEach(p => {
      batch.set(doc(collection(db, 'products'), p.id), p);
    });

    await batch.commit();
    alert('資料已成功導入！');
  };

  const statusConfig: Record<OrderStatus, { label: string, color: string, icon: any }> = {
    pending: { label: '待處理', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    preparing: { label: '製作中', color: 'bg-blue-100 text-blue-800', icon: PlayCircle },
    completed: { label: '已完成', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { label: '已取消', color: 'bg-red-100 text-red-800', icon: XCircle },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">訂單管理後台</h1>
          <p className="text-gray-500">即時監控訂單狀態，提供最優質的服務。</p>
        </div>
        <button 
          onClick={seedData}
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 transition-colors"
        >
          <Database className="h-4 w-4" />
          導入測試資料
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          <AnimatePresence>
            {orders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed">
                <p className="text-gray-400">目前尚無訂單</p>
              </div>
            ) : (
              orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="flex-grow p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">訂單編號</span>
                          <h3 className="font-mono text-sm">#{order.id.slice(-8)}</h3>
                        </div>
                        <div className={cn("flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold", statusConfig[order.status].color)}>
                          {React.createElement(statusConfig[order.status].icon, { className: "h-3 w-3" })}
                          {statusConfig[order.status].label}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between border-b border-gray-50 pb-2">
                            <div>
                              <p className="font-bold">{item.name} <span className="text-gray-400 font-normal">x {item.quantity}</span></p>
                              <p className="text-xs text-gray-500">{item.sugar} / {item.ice}</p>
                            </div>
                            <p className="font-medium text-gray-600">${item.price * item.quantity}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : '剛才'}
                        </p>
                        <p className="text-xl font-black text-gray-900">總計 ${order.totalPrice}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 sm:w-48 flex flex-row sm:flex-col gap-2 border-t sm:border-t-0 sm:border-l border-gray-100">
                      <button 
                        onClick={() => updateStatus(order.id, 'preparing')}
                        className="flex-grow rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
                      >
                        開始製作
                      </button>
                      <button 
                        onClick={() => updateStatus(order.id, 'completed')}
                        className="flex-grow rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700 transition-colors"
                      >
                        已完成
                      </button>
                      <button 
                         onClick={() => updateStatus(order.id, 'cancelled')}
                        className="flex-grow rounded-xl bg-white border border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
