import React, { useRef, useState } from 'react';
import { UploadCloud, Image, Film, FileArchive } from 'lucide-react';
import { useTransfer } from '../../context/TransferContext.jsx';

export function Dropzone() {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const { addFiles } = useTransfer();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`border-3 border-dashed border-black rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 shadow-brutal hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-lg ${
        isDragOver ? 'bg-[#FFE600] scale-[1.01]' : 'bg-[#FFFDF5] hover:bg-[#FEFCE8]'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      <div className="w-20 h-20 rounded-2xl bg-[#00F0FF] border-3 border-black flex items-center justify-center text-black mb-4 shadow-brutal">
        <UploadCloud className="w-10 h-10 stroke-[2.5]" />
      </div>

      <h3 className="text-xl font-black text-black uppercase tracking-tight mb-1">
        Drag & drop files here, or <span className="underline decoration-4 underline-offset-4 decoration-black">browse</span>
      </h3>
      <p className="text-xs font-bold text-slate-700 max-w-md mb-6">
        Support photos, 4K videos, documents, ZIP archives, and multi-gigabyte files.
      </p>

      <div className="flex flex-wrap justify-center gap-3 text-xs font-black text-black">
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FFE600] border-2 border-black shadow-brutal-sm">
          <Image className="w-4 h-4 stroke-[3]" />
          <span>PHOTOS</span>
        </div>
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FF6B99] border-2 border-black shadow-brutal-sm">
          <Film className="w-4 h-4 stroke-[3]" />
          <span>VIDEOS</span>
        </div>
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#A3E635] border-2 border-black shadow-brutal-sm">
          <FileArchive className="w-4 h-4 stroke-[3]" />
          <span>ARCHIVES</span>
        </div>
      </div>
    </div>
  );
}
