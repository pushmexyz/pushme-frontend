'use client';

import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface MediaUploaderProps {
  type: 'image' | 'gif' | 'audio' | 'video';
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

export default function MediaUploader({
  type,
  onFileSelect,
  onRemove,
  maxSizeMB = 10,
  acceptedFormats,
}: MediaUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultFormats: Record<string, string[]> = {
    image: ['image/jpeg', 'image/png', 'image/webp'],
    gif: ['image/gif'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    video: ['video/mp4', 'video/webm'],
  };

  const formats = acceptedFormats || defaultFormats[type] || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError('');

    // Check format
    if (!formats.includes(selectedFile.type)) {
      setError(`Invalid format. Accepted: ${formats.join(', ')}`);
      return;
    }

    // Check size
    const sizeMB = selectedFile.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      setError(`File too large. Max size: ${maxSizeMB}MB`);
      return;
    }

    setFile(selectedFile);
    onFileSelect(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setError('');
    onRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#FF2B2B] transition-colors"
        >
          <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="font-dm-sans text-gray-600 mb-1">
            Click to upload {type}
          </p>
          <p className="text-sm text-gray-400">
            Max {maxSizeMB}MB • {formats.map((f) => f.split('/')[1]).join(', ')}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept={formats.join(',')}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          {type === 'image' || type === 'gif' ? (
            <img
              src={preview || ''}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
          ) : type === 'video' ? (
            <video
              src={preview || ''}
              controls
              className="w-full h-48 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="font-dm-sans text-gray-600">{file.name}</p>
            </div>
          )}
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="mt-2 text-sm text-gray-600 font-dm-sans">
            {(file.size / (1024 * 1024)).toFixed(2)} MB
          </p>
        </motion.div>
      )}
      {error && (
        <p className="text-sm text-red-500 font-dm-sans">{error}</p>
      )}
    </div>
  );
}

