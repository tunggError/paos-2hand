"use client";

import { motion } from 'framer-motion';

interface AnnouncementCardProps {
  id: string;
  description: string;
  image: string;
  timestamp: string;
  permalink: string;
}

export default function AnnouncementCard({
  description,
  image,
  timestamp,
  permalink
}: AnnouncementCardProps) {
  const formattedDate = new Date(timestamp).toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-none overflow-hidden transition-all duration-300 border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(17,24,39,1)] group flex flex-col relative h-full"
    >
      <div className="w-full relative aspect-video overflow-hidden bg-cream-200 border-b-4 border-gray-900 shrink-0">
        <motion.img 
          src={image} 
          alt="Announcement"
          loading="lazy"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
          className="object-cover w-full h-full"
        />
        <div className="absolute top-4 left-4 z-20">
          <span className="bg-red-600 text-white text-xs font-black px-4 py-2 uppercase tracking-widest border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] animate-pulse">
            Thông báo mới
          </span>
        </div>
      </div>
      
      <div className="p-6 md:p-8 flex flex-col justify-between flex-grow bg-white">
        <div>
          <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter line-clamp-2">Bản Tin Mới</h3>
          <p className="text-olive-700 font-black mb-4 text-sm uppercase tracking-widest bg-cream-200 inline-block px-3 py-1 border-2 border-gray-900 w-fit">{formattedDate}</p>
          
          <div className="prose prose-olive mb-6 whitespace-pre-wrap text-gray-800 font-medium text-sm line-clamp-3">
            {description}
          </div>
        </div>
        
        <div className="mt-auto">
          <a 
            href={permalink} 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-olive-600 text-white px-8 py-3 text-sm font-black uppercase tracking-widest border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] hover:bg-olive-700 hover:shadow-[6px_6px_0px_0px_rgba(17,24,39,1)] hover:-translate-y-1 transition-all"
          >
            Xem bài viết trên IG
          </a>
        </div>
      </div>
    </motion.div>
  );
}
