import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Category, Product } from '../types';
import { motion } from 'motion/react';
import { Plus, Info, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { cn } from '../lib/utils';

export default function Menu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      const catSnap = await getDocs(query(collection(db, 'categories'), orderBy('order')));
      const prodSnap = await getDocs(collection(db, 'products'));
      
      const cats = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      const prods = prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      
      setCategories(cats);
      setProducts(prods);
      if (cats.length > 0) setActiveCategory(cats[0].id);
    };
    fetchData();
  }, []);

  const filteredProducts = activeCategory 
    ? products.filter(p => p.categoryId === activeCategory)
    : products;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          精選茶飲
        </h1>
        <p className="mt-4 text-xl text-gray-500">
          每日現泡，嚴選茶葉，給你最純粹的甘甜。
        </p>
      </header>

      {/* Category Tabs */}
      <div className="mb-12 flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "rounded-full px-6 py-2 text-sm font-medium transition-all duration-200",
              activeCategory === cat.id
                ? "bg-orange-600 text-white shadow-lg shadow-orange-200"
                : "bg-white text-gray-600 hover:bg-gray-100"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={product.id}
            className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-xl"
          >
            <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
              <img
                src={product.imageUrl || 'https://images.unsplash.com/photo-1544787210-2213d24293f0?q=80&w=600&auto=format&fit=crop'}
                alt={product.name}
                className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="mt-6 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
              </div>
              <p className="text-lg font-bold text-orange-600">${product.price}</p>
            </div>
            <div className="mt-6 flex gap-2">
              <button 
                onClick={() => setSelectedProduct(product)}
                className="flex-grow flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-700"
              >
                <Plus className="h-4 w-4" />
                點餐
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Product Detail Modal (Simplified for this version) */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onAdd={addToCart}
        />
      )}
    </div>
  );
}

function ProductModal({ product, onClose, onAdd }: { product: Product, onClose: () => void, onAdd: any }) {
  const [sugar, setSugar] = useState('正常糖');
  const [ice, setIce] = useState('正常冰');
  const [quantity, setQuantity] = useState(1);

  const sugarLevels = product.options?.sugarLevels || ['無糖', '三分糖', '半糖', '七分糖', '正常糖'];
  const iceLevels = product.options?.iceLevels || ['去冰', '微冰', '少冰', '正常冰', '熱飲'];

  const handleSubmit = () => {
    onAdd({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      sugar,
      ice,
      toppings: []
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="p-8">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">{product.name}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          
          <div className="mt-8 space-y-6">
            <div>
              <label className="text-sm font-bold text-gray-500">甜度</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {sugarLevels.map(level => (
                  <button
                    key={level}
                    onClick={() => setSugar(level)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm transition-all",
                      sugar === level ? "border-orange-600 bg-orange-50 text-orange-600" : "border-gray-200 text-gray-600"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-500">冰量</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {iceLevels.map(level => (
                  <button
                    key={level}
                    onClick={() => setIce(level)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm transition-all",
                      ice === level ? "border-orange-600 bg-orange-50 text-orange-600" : "border-gray-200 text-gray-600"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center text-xl"
                >
                  -
                </button>
                <span className="text-lg font-bold w-4 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center text-xl"
                >
                  +
                </button>
              </div>
              <p className="text-2xl font-bold text-orange-600">${product.price * quantity}</p>
            </div>

            <button 
              onClick={handleSubmit}
              className="w-full rounded-2xl bg-orange-600 py-4 text-lg font-bold text-white shadow-lg shadow-orange-200 transition-transform active:scale-95"
            >
              加入購物車
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
