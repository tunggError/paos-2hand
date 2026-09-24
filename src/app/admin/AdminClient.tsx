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
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'KHO_HANG' | 'THEM_SP'>('KHO_HANG');
  const [addForm, setAddForm] = useState({ 
    name: '', 
    price: '', 
    image: '', 
    description: '',
    condition: '9/10',
    n: 0,
    d: 0
  });
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Append to existing instead of replace
      const newFiles = [...selectedFiles, ...files];
      setSelectedFiles(newFiles);
      const urls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewImages(urls);
    }
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index > 0) {
      const newFiles = [...selectedFiles];
      const newUrls = [...previewImages];
      [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
      [newUrls[index - 1], newUrls[index]] = [newUrls[index], newUrls[index - 1]];
      setSelectedFiles(newFiles);
      setPreviewImages(newUrls);
    } else if (direction === 'right' && index < selectedFiles.length - 1) {
      const newFiles = [...selectedFiles];
      const newUrls = [...previewImages];
      [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
      [newUrls[index], newUrls[index + 1]] = [newUrls[index + 1], newUrls[index]];
      setSelectedFiles(newFiles);
      setPreviewImages(newUrls);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = previewImages.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviewImages(newUrls);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newFiles = [...selectedFiles];
    const newUrls = [...previewImages];
    
    const draggedFile = newFiles[draggedIndex];
    const draggedUrl = newUrls[draggedIndex];
    
    newFiles.splice(draggedIndex, 1);
    newUrls.splice(draggedIndex, 1);
    
    newFiles.splice(targetIndex, 0, draggedFile);
    newUrls.splice(targetIndex, 0, draggedUrl);
    
    setSelectedFiles(newFiles);
    setPreviewImages(newUrls);
    setDraggedIndex(targetIndex);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

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
    setProducts(products.map(p => p.id === editingId ? { ...p, ...editForm } : p));
    setEditingId(null);
    try { await setProductOverride(editingId, editForm); } catch (err) {}
  };

  const handleDeleteManual = async (id: string) => {
    if (!confirm("Xóa nhé?")) return;
    setProducts(products.filter(p => p.id !== id));
    try { await deleteManualProduct(id); } catch (err) {}
  };

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    let imageUrls: string[] = addForm.image ? addForm.image.split(',').map(u => u.trim()) : [];

    if (selectedFiles.length > 0) {
      try {
        const { uploadImage } = await import('./actions');
        
        // Upload all files in parallel
        const uploadPromises = selectedFiles.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          return await uploadImage(formData);
        });
        
        const uploadedUrls = await Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...uploadedUrls];
      } catch (err) {
        alert("Lỗi khi tải ảnh lên!");
        setIsUploading(false);
        return;
      }
    }

    if (imageUrls.length === 0) {
      alert("Vui lòng chọn ảnh!");
      setIsUploading(false);
      return;
    }

    const newProduct: Product = {
      id: 'manual_' + Date.now(),
      name: addForm.name,
      price: addForm.price,
      image: imageUrls[0], // First image as main
      images: imageUrls,
      description: addForm.description,
      condition: addForm.condition,
      measurements: { n: addForm.n, d: addForm.d },
      isSold: false,
      isAnnouncement: false,
      isManual: true
    };
    
    setProducts([newProduct, ...products]);
    setActiveTab('KHO_HANG');
    setIsUploading(false);
    setAddForm({ name: '', price: '', image: '', description: '', condition: '9/10', n: 0, d: 0 });
    setPreviewImages([]);
    setSelectedFiles([]);
    
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

  // Dashboard Calculations
  const totalProducts = products.length;
  const soldProducts = products.filter(p => p.isSold).length;
  const availableProducts = totalProducts - soldProducts;

  const totalRevenue = products.reduce((acc, p) => {
    if (p.isSold && p.price) {
      const numStr = p.price.replace(/[^\d]/g, '');
      const num = parseInt(numStr, 10);
      if (!isNaN(num)) return acc + num;
    }
    return acc;
  }, 0);
  
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 pb-4">
        <button
          onClick={() => setActiveTab('KHO_HANG')}
          className={`font-black uppercase px-6 py-3 border-4 border-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] transition-colors ${activeTab === 'KHO_HANG' ? 'bg-olive-600 text-white' : 'bg-white text-gray-900 hover:bg-cream-200'}`}
        >
          KHO HÀNG & THỐNG KÊ
        </button>
        <button
          onClick={() => setActiveTab('THEM_SP')}
          className={`font-black uppercase px-6 py-3 border-4 border-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] transition-colors ${activeTab === 'THEM_SP' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900 hover:bg-cream-200'}`}
        >
          + THÊM SẢN PHẨM THỦ CÔNG
        </button>
      </div>

      {activeTab === 'KHO_HANG' && (
        <>
          {/* Dashboard Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-black uppercase text-gray-900 mb-6">Tổng Quan Kho Hàng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border-4 border-gray-900 p-6 shadow-[6px_6px_0px_0px_rgba(17,24,39,1)]">
                <h3 className="font-bold text-gray-500 uppercase text-xs mb-2 tracking-widest">Tổng Sản Phẩm</h3>
                <p className="text-4xl font-black text-gray-900">{totalProducts}</p>
              </div>
              <div className="bg-olive-600 border-4 border-gray-900 p-6 shadow-[6px_6px_0px_0px_rgba(17,24,39,1)]">
                <h3 className="font-bold text-cream-200 uppercase text-xs mb-2 tracking-widest">Đang Bán</h3>
                <p className="text-4xl font-black text-white">{availableProducts}</p>
              </div>
              <div className="bg-red-600 border-4 border-gray-900 p-6 shadow-[6px_6px_0px_0px_rgba(17,24,39,1)]">
                <h3 className="font-bold text-red-200 uppercase text-xs mb-2 tracking-widest">Đã Bán</h3>
                <p className="text-4xl font-black text-white">{soldProducts}</p>
              </div>
              <div className="bg-yellow-400 border-4 border-gray-900 p-6 shadow-[6px_6px_0px_0px_rgba(17,24,39,1)]">
                <h3 className="font-bold text-yellow-900 uppercase text-xs mb-2 tracking-widest">Doanh Thu Ước Tính</h3>
                <p className="text-3xl font-black text-gray-900 line-clamp-1" title={formatMoney(totalRevenue)}>{formatMoney(totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="mb-8 pt-8 border-t-4 border-gray-900">
            <h2 className="text-2xl font-black uppercase text-gray-900 mb-6">Danh sách Sản Phẩm</h2>
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
        </>
      )}

      {activeTab === 'THEM_SP' && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-4 border-gray-900 p-6 mb-8 shadow-[8px_8px_0px_0px_rgba(17,24,39,1)] flex flex-col lg:flex-row gap-8"
        >
          {/* Form */}
          <form onSubmit={handleAddManual} className="flex-1 min-w-0">
            <h3 className="font-black uppercase text-lg mb-4 text-gray-900 border-b-2 border-gray-900 pb-2">Thông tin Sản phẩm</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-bold text-gray-900 text-sm mb-1 uppercase">Tên sản phẩm</label>
                <input required placeholder="VD: ÁO SƠ MI CARHARTT" value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} className="w-full border-2 border-gray-900 p-2 font-bold text-gray-900 placeholder-gray-500" />
              </div>
              <div>
                <label className="block font-bold text-gray-900 text-sm mb-1 uppercase">Giá (Kèm chữ đ)</label>
                <input required placeholder="VD: 350.000đ" value={addForm.price} onChange={e => setAddForm({...addForm, price: e.target.value})} className="w-full border-2 border-gray-900 p-2 font-bold text-gray-900 placeholder-gray-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block font-bold text-gray-900 text-sm mb-1 uppercase">Độ mới (Cond)</label>
                <input placeholder="VD: 9/10" value={addForm.condition} onChange={e => setAddForm({...addForm, condition: e.target.value})} className="w-full border-2 border-gray-900 p-2 font-bold text-gray-900 placeholder-gray-500" />
              </div>
              <div>
                <label className="block font-bold text-gray-900 text-sm mb-1 uppercase">Ngang (cm)</label>
                <input type="number" value={addForm.n || ''} onChange={e => setAddForm({...addForm, n: Number(e.target.value)})} className="w-full border-2 border-gray-900 p-2 font-bold text-gray-900 placeholder-gray-500" />
              </div>
              <div>
                <label className="block font-bold text-gray-900 text-sm mb-1 uppercase">Dài (cm)</label>
                <input type="number" value={addForm.d || ''} onChange={e => setAddForm({...addForm, d: Number(e.target.value)})} className="w-full border-2 border-gray-900 p-2 font-bold text-gray-900 placeholder-gray-500" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block font-bold text-gray-900 text-sm mb-1 uppercase">Mô tả thêm (Tùy chọn)</label>
              <textarea placeholder="Ghi chú về chất liệu, lỗi nhỏ (nếu có)..." value={addForm.description} onChange={e => setAddForm({...addForm, description: e.target.value})} className="w-full border-2 border-gray-900 p-2 font-bold text-gray-900 placeholder-gray-500 h-20 resize-none" />
            </div>

            <div className="mb-6 bg-cream-100 p-4 border-2 border-gray-900 border-dashed">
              <label className="block font-black text-gray-900 mb-2 uppercase">Hình ảnh Sản Phẩm (Có thể chọn nhiều)</label>
              <input type="file" accept="image/*" multiple onChange={handleImagePick} className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:border-2 file:border-gray-900 file:bg-gray-900 file:text-white file:font-black file:uppercase hover:file:bg-olive-600 transition-colors cursor-pointer mb-4" />
              
              {previewImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-900 mb-2 uppercase">Ảnh đã chọn ({previewImages.length}):</p>
                  <div className="flex flex-wrap gap-2 pb-2">
                    {previewImages.map((img, idx) => (
                      <div 
                        key={img} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragEnter={(e) => handleDragEnter(e, idx)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        className={`relative w-24 h-24 flex-shrink-0 border-2 border-gray-900 group cursor-move ${draggedIndex === idx ? 'opacity-50 border-dashed bg-gray-200' : ''}`}
                      >
                        <img src={img} className="w-full h-full object-cover pointer-events-none" />
                        <div className="absolute top-0 right-0 bg-gray-900 text-white text-[10px] font-black px-1.5 py-0.5 z-10">{idx + 1}</div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center gap-1 transition-opacity z-20">
                          <button type="button" onClick={() => removeImage(idx)} className="bg-red-600 text-white text-xs px-2 py-0.5 uppercase font-bold hover:bg-red-700">Xóa</button>
                          <span className="text-white text-[10px] font-bold uppercase mt-1">Kéo thả</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500 font-bold border-t-2 border-gray-900 border-dashed pt-4">Hoặc dán nhiều link ảnh (cách nhau dấu phẩy):</p>
              <input placeholder="https://anh1.jpg, https://anh2.jpg" value={addForm.image} onChange={e => setAddForm({...addForm, image: e.target.value})} className="w-full mt-1 border-2 border-gray-900 p-2 font-bold text-gray-900 placeholder-gray-500 text-xs" />
            </div>

            <button type="submit" disabled={isUploading} className="w-full bg-olive-600 text-white font-black px-6 py-4 border-2 border-gray-900 uppercase shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed">
              {isUploading ? 'ĐANG TẢI LÊN...' : 'ĐĂNG BÁN SẢN PHẨM NÀY'}
            </button>
          </form>

          {/* Live Preview Area */}
          <div className="w-full lg:w-[320px] lg:shrink-0 border-l-0 lg:border-l-4 lg:border-gray-900 lg:pl-8 pt-8 lg:pt-0">
            <h3 className="font-black uppercase text-sm mb-4 text-gray-900 bg-cream-200 inline-block px-2 py-1 border-2 border-gray-900 shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]">
              XEM TRƯỚC (LIVE PREVIEW)
            </h3>
            <div className="pointer-events-none transform scale-[0.85] origin-top-left w-[117%]">
              <div className="bg-white border-4 border-gray-900 shadow-[6px_6px_0px_0px_rgba(17,24,39,1)] flex flex-col">
                <div className="relative h-[250px] border-b-4 border-gray-900 bg-gray-100 flex overflow-x-auto snap-x snap-mandatory hide-scrollbar">
                  {previewImages.length > 0 || addForm.image ? (
                    (previewImages.length > 0 ? previewImages : addForm.image.split(',').map(u => u.trim())).map((img, idx) => (
                      <div key={idx} className="min-w-full h-full flex-shrink-0 snap-center relative">
                        <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      </div>
                    ))
                  ) : (
                    <div className="min-w-full h-full flex items-center justify-center">
                      <span className="text-gray-400 font-bold uppercase text-xs text-center px-4">Chưa có ảnh</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 bg-gray-900 text-white text-xs font-black uppercase px-2 py-1 border-t-2 border-r-2 border-gray-900 z-10">
                    Cond {addForm.condition || '9/10'}
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col bg-white">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-black text-gray-900 uppercase text-lg leading-tight line-clamp-2">
                      {addForm.name || 'TÊN SẢN PHẨM'}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-block bg-cream-200 border-2 border-gray-900 px-2 py-0.5 text-xs font-bold text-gray-900 whitespace-nowrap">
                      Ngang: {addForm.n || 0}
                    </span>
                    <span className="inline-block bg-cream-200 border-2 border-gray-900 px-2 py-0.5 text-xs font-bold text-gray-900 whitespace-nowrap">
                      Dài: {addForm.d || 0}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                    {addForm.description || 'Mô tả sản phẩm sẽ hiện ở đây...'}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t-2 border-gray-900 border-dashed">
                    <span className="font-black text-xl text-olive-600">{addForm.price || '0đ'}</span>
                    <div className="bg-gray-900 text-white font-black px-3 py-1.5 uppercase text-xs">
                      SHOP NOW
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
