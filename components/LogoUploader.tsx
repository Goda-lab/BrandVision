
import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface LogoUploaderProps {
  onUpload: (base64: string) => void;
  currentLogo: string | null;
  onClear: () => void;
}

const LogoUploader: React.FC<LogoUploaderProps> = ({ onUpload, currentLogo, onClear }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-gray-700 block">Brand Logo</label>
      {currentLogo ? (
        <div className="relative group rounded-xl overflow-hidden border-2 border-indigo-100 bg-white p-2">
          <img src={currentLogo} alt="Logo preview" className="h-20 w-full object-contain" />
          <button
            onClick={onClear}
            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center py-6 px-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all text-gray-500 group"
        >
          <Upload className="mb-2 group-hover:text-indigo-500" size={24} />
          <span className="text-xs font-medium">Upload PNG or SVG</span>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </button>
      )}
    </div>
  );
};

export default LogoUploader;
