import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Category, Product } from '../types';
import { Plus, Trash2, Edit3, Save, X } from 'lucide-react';

export default function AdminMenu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  useEffect(() => {
    const unsubCats = onSnapshot(query(collection(db, 'categories'), orderBy('order')), (snap) => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() } as Category)));
    });
    const unsubProds = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    });
    return () => { unsubCats(); unsubProds(); };
  }, []);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      if (editingProduct.id) {
        const { id, ...data } = editingProduct;
        await updateDoc(doc(db, 'products', id), data);
      } else {
        await addDoc(collection(db, 'products'), editingProduct);
      }
      setEditingProduct(null);
    } catch (error) {
      console.error("Save failed", error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('確定要刪除此商品嗎？')) {
      await deleteDoc(doc(db, 'products', id));
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">菜單管理</h1>
        <button 
          onClick={() => setEditingProduct({ name: '', price: 0, description: '', categoryId: categories[0]?.id || '', imageUrl: '' })}
          className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
        >
          <Plus className="h-4 w-4" />
          新增商品
        </button>
      </div>

      <div className="grid gap-6">
        {categories.map(cat => (
          <section key={cat.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">{cat.name}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs text-gray-400 uppercase tracking-widest border-b">
                  <tr>
                    <th className="py-3 font-bold">商品名稱</th>
                    <th className="py-3 font-bold">價格</th>
                    <th className="py-3 font-bold">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.filter(p => p.categoryId === cat.id).map(product => (
                    <tr key={product.id} className="group hover:bg-gray-50 transition-colors">
                      <td className="py-4 font-bold text-gray-700">{product.name}</td>
                      <td className="py-4 text-orange-600 font-mono">${product.price}</td>
                      <td className="py-4">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setEditingProduct(product)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      {editingProduct && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{editingProduct.id ? '編輯商品' : '新增商品'}</h3>
              <button onClick={() => setEditingProduct(null)}><X /></button>
            </div>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">名稱</label>
                <input 
                  required
                  value={editingProduct.name}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full mt-1 px-4 py-2 bg-gray-50 border-none rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">價格</label>
                  <input 
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full mt-1 px-4 py-2 bg-gray-50 border-none rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">分類</label>
                  <select 
                    value={editingProduct.categoryId}
                    onChange={e => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                    className="w-full mt-1 px-4 py-2 bg-gray-50 border-none rounded-xl"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">描述</label>
                <textarea 
                  value={editingProduct.description}
                  onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full mt-1 px-4 py-2 bg-gray-50 border-none rounded-xl"
                />
              </div>
              <button 
                type="submit"
                className="w-full mt-4 flex items-center justify-center gap-2 rounded-2xl bg-gray-900 py-3 text-white font-bold"
              >
                <Save className="h-4 w-4" />
                儲存設定
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
