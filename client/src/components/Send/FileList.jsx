import React from 'react';
import { FileText, Trash2, Image, Film, FileArchive, Music } from 'lucide-react';
import { formatBytes } from '../../utils/formatters.js';
import { Button } from '../Common/Button.jsx';
import { useTransfer } from '../../context/TransferContext.jsx';

export function FileList() {
  const { selectedFiles, removeFile, clearFiles } = useTransfer();

  if (selectedFiles.length === 0) return null;

  const totalSize = selectedFiles.reduce((acc, f) => acc + f.size, 0);

  const getFileIcon = (type = '') => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5 stroke-[2.5]" />;
    if (type.startsWith('video/')) return <Film className="w-5 h-5 stroke-[2.5]" />;
    if (type.startsWith('audio/')) return <Music className="w-5 h-5 stroke-[2.5]" />;
    if (type.includes('zip') || type.includes('tar') || type.includes('rar') || type.includes('compressed')) return <FileArchive className="w-5 h-5 stroke-[2.5]" />;
    return <FileText className="w-5 h-5 stroke-[2.5]" />;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-base font-black uppercase text-black">
            Selected Files ({selectedFiles.length})
          </h4>
          <p className="text-xs font-bold text-slate-700">Total payload size: {formatBytes(totalSize)}</p>
        </div>
        <Button variant="danger" size="sm" onClick={clearFiles}>
          Clear All
        </Button>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
        {selectedFiles.map((file, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3.5 rounded-xl bg-white border-2 border-black shadow-brutal-sm text-sm"
          >
            <div className="flex items-center gap-3 min-w-0 pr-3">
              <div className="w-9 h-9 rounded-lg bg-[#00F0FF] border-2 border-black flex items-center justify-center shrink-0 shadow-brutal-sm">
                {getFileIcon(file.type)}
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-black truncate">{file.name}</p>
                <p className="text-xs text-slate-700 font-mono font-bold">{formatBytes(file.size)}</p>
              </div>
            </div>

            <button
              onClick={() => removeFile(idx)}
              className="p-2 text-black bg-[#FF6B99] hover:bg-[#FF8DAF] border-2 border-black rounded-lg transition-all shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              title="Remove file"
            >
              <Trash2 className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
