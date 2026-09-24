"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ProductCardProps {
  id: string;
  image: string;
  name: string;
  condition: string;
  measurements: { n: number; d: number };
  description: string;
  price: string;
  isSold: boolean;
}

export default function ProductCard({
  id,
  image,
  name,
  condition,
  measurements,
  description,
  price,
  isSold,
}: ProductCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
      className="group flex flex-col bg-white rounded-none overflow-hidden border-4 border-gray-900 shadow-[6px_6px_0px_0px_rgba(17,24,39,1)] hover:-translate-y-2 transition-transform duration-300 relative"
    >
      <Link href={`/product/${id}`} className="relative aspect-[4/5] w-full overflow-hidden bg-cream-100 block border-b-4 border-gray-900">
        <motion.img 
          src={image} 
          alt={name} 
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
          className={`object-cover w-full h-full ${isSold ? 'grayscale opacity-70' : ''}`}
        />
        {isSold && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <span className="bg-red-600 text-white font-black px-6 py-2 rounded-full text-lg uppercase tracking-widest shadow-lg transform -rotate-12">
              Đã Bán
            </span>
          </div>
        )}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
          <span className="bg-gray-900 text-white text-xs font-black px-3 py-1.5 uppercase tracking-widest border-2 border-transparent">
            Cond: {condition}
          </span>
          <span className="bg-white text-gray-900 text-xs font-black px-3 py-1.5 uppercase tracking-widest border-2 border-gray-900 shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]">
            {measurements.n}x{measurements.d}
          </span>
        </div>
      </Link>
      
      <div className="p-5 flex flex-col flex-grow bg-white">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/product/${id}`}>
            <h3 className="font-black text-xl text-gray-900 line-clamp-2 uppercase leading-tight hover:text-olive-600 transition-colors">
              {name}
            </h3>
          </Link>
        </div>
        
        <div className="text-sm text-gray-600 mb-3 space-y-1">
          <p className="font-medium text-olive-700">
            Kích thước: {measurements && measurements.n > 0 ? `Ngang ${measurements.n}cm - Dài ${measurements.d}cm` : 'Đang cập nhật'}
          </p>
          <p className="line-clamp-2 text-xs text-gray-500 leading-relaxed">{description}</p>
        </div>
        
        <div className="mt-auto flex items-center justify-between pt-4 border-t-4 border-gray-900">
          <span className={`font-black text-2xl tracking-tighter ${isSold ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{price}</span>
          <motion.button 
            whileHover={!isSold ? { scale: 1.05 } : {}}
            whileTap={!isSold ? { scale: 0.95 } : {}}
            disabled={isSold}
            className={`${isSold ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-2 border-gray-400' : 'bg-olive-600 text-white border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] hover:bg-olive-700'} px-5 py-2 text-sm font-black uppercase tracking-wider transition-all flex items-center gap-2`}
          >
            {isSold ? 'Đã hết' : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                  <path d="M3 6h18"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                MUA
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
