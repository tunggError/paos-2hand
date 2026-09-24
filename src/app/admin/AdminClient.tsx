"use client";
import { useState, useEffect } from 'react';
import { Product } from '@/lib/data';
import { setProductOverride, addManualProduct, deleteManualProduct } from './actions';
import { motion } from 'framer-motion';

export default function AdminClient({ initialProducts }: { initialProducts: Product[] }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState(initialProducts);

  useEffect(() => {
    if (localStorage.getItem('adminAuth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // States for Editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', isSold: false });

  // States for Adding Manual Product
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', price: '', image: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'paos2026') {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
    } else {
      alert("Sai mật khẩu!");
    }
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setEditForm({ name: p.name, price: p.price, isSold: p.isSold });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    
    // Optimistic UI update
    setProducts(products.map(p => p.id === editingId ? { ...p, ...editForm } : p));
    setEditingId(null);
    
    // Save to DB
    try {
      await setProductOverride(editingId, editForm);
    } catch (err) {
      alert("Lỗi khi lưu! Vui lòng thử lại.");
    }
  };

  const handleDeleteManual = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm thêm thủ công này không?")) return;
    
    setProducts(products.filter(p => p.id !== id));
    try {
      await deleteManualProduct(id);
    } catch (err) {
      alert("Lỗi khi xóa!");
    }
  };

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: 'manual_' + Date.now(),
      name: addForm.name,
      price: addForm.price,
      image: addForm.image,
      isSold: false,
      isAnnouncement: false,
      isManual: true
    };
    
    setProducts([newProduct, ...products]);
    setIsAdding(false);
    setAddForm({ name: '', price: '', image: '' });
    
    try {
      await addManualProduct(newProduct);
    } catch (err) {
      alert("Lỗi khi thêm!");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center mt-20">
        <form onSubmit={handleLogin} className="bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(17,24,39,1)] p-8 w-full max-w-md">
          <h2 className="text-2xl font-black uppercase tracking-widest text-gray-900 mb-6">Đăng nhập Quản trị</h2>
          <input 
            type="password"
            placeholder="Nhập mật khẩu..."
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border-2 border-gray-900 p-3 mb-6 bg-cream-100 font-bold text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-olive-600"
          />
          <button type="submit" className="w-full bg-olive-600 text-white font-black p-3 border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] hover:bg-gray-900 transition-colors uppercase tracking-widest">
            Vào Trang Quản Trị
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black uppercase text-gray-900">Quản lý Kho Hàng</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-gray-900 text-white font-black px-6 py-2 border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] hover:bg-olive-600 uppercase"
        >
          {isAdding ? "Hủy" : "+ Thêm SP Thủ công"}
        </button>
      </div>

      {isAdding && (
        <motion.form 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleAddManual} 
          className="bg-white border-4 border-gray-900 p-6 mb-8 shadow-[8px_8px_0px_0px_rgba(17,24,39,1)]"
        >
          <h3 className="font-black uppercase text-lg mb-4 text-gray-900 border-b-2 border-gray-900 pb-2">Thêm Sản phẩm Mới</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input required placeholder="Tên sản phẩm" value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} className="border-2 border-gray-900 p-2 font-bold text-gray-900 placeholder-gray-500" />
            <input required placeholder="Giá (VD: 350.000đ)" value={addForm.price} onChange={e => setAddForm({...addForm, price: e.target.value})} className="border-2 border-gray-900 p-2 font-bold text-gray-900 placeholder-gray-500" />
            <input required placeholder="Link ảnh URL" value={addForm.image} onChange={e => setAddForm({...addForm, image: e.target.value})} className="border-2 border-gray-900 p-2 font-bold text-gray-900 placeholder-gray-500" />
          </div>
          <button type="submit" className="bg-olive-600 text-white font-black px-6 py-2 border-2 border-gray-900 uppercase">
            Lưu Sản Phẩm
          </button>
        </motion.form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(p => (
          <div key={p.id} className={`bg-white border-4 border-gray-900 shadow-[6px_6px_0px_0px_rgba(17,24,39,1)] flex flex-col ${p.isSold ? 'opacity-70 grayscale' : ''}`}>
            <div className="relative h-48 border-b-4 border-gray-900">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              {p.isSold && <div className="absolute top-2 right-2 bg-red-600 text-white font-black px-2 py-1 border-2 border-gray-900 uppercase text-xs transform rotate-12">Đã Bán</div>}
              {p.isManual && <div className="absolute top-2 left-2 bg-blue-600 text-white font-black px-2 py-1 border-2 border-gray-900 uppercase text-xs">Thủ công</div>}
              {p.isAnnouncement && <div className="absolute top-2 left-2 bg-yellow-400 text-gray-900 font-black px-2 py-1 border-2 border-gray-900 uppercase text-xs">Thông báo</div>}
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
              {editingId === p.id ? (
                <div className="space-y-3 flex-1 text-gray-900">
                  <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full border-2 border-gray-900 p-1 text-sm font-bold" />
                  <input value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className="w-full border-2 border-gray-900 p-1 text-sm font-bold" />
                  <label className="flex items-center gap-2 font-bold text-sm cursor-pointer">
                    <input type="checkbox" checked={editForm.isSold} onChange={e => setEditForm({...editForm, isSold: e.target.checked})} className="w-4 h-4 border-2 border-gray-900 accent-red-600" />
                    Đánh dấu HẾT HÀNG
                  </label>
                  <div className="flex gap-2 pt-2">
                    <button onClick={handleSaveEdit} className="bg-olive-600 text-white font-black px-3 py-1 border-2 border-gray-900 flex-1 text-xs uppercase">Lưu</button>
                    <button onClick={() => setEditingId(null)} className="bg-gray-200 text-gray-900 font-black px-3 py-1 border-2 border-gray-900 flex-1 text-xs uppercase">Hủy</button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-bold text-sm uppercase line-clamp-2 text-gray-900 mb-2">{p.name}</h3>
                  <p className="font-black text-olive-600 mt-auto mb-4">{p.price}</p>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(p)}
                      className="bg-gray-100 text-gray-900 font-black px-3 py-2 border-2 border-gray-900 hover:bg-gray-200 flex-1 text-xs uppercase tracking-wider"
                    >
                      Sửa
                    </button>
                    {p.isManual && (
                      <button 
                        onClick={() => handleDeleteManual(p.id)}
                        className="bg-red-600 text-white font-black px-3 py-2 border-2 border-gray-900 hover:bg-red-700 text-xs uppercase tracking-wider"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
