import React, { useState, useCallback, useEffect } from 'react';
import { UploadIcon, XCircleIcon } from './Icons';
import { Droplets } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { convertToGrayscale, dataURLtoFile } from '@/lib/imageUtils';

interface ImageUploaderProps {
  id: string;
  label: string;
  onFileSelect: (file: File | null, previewUrl: string | null) => void;
  isRequired?: boolean;
  previewUrl?: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, onFileSelect, isRequired, previewUrl }) => {
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    setPreview(previewUrl || null);
  }, [previewUrl]);

  const handleFileChange = useCallback((file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onFileSelect(file, result);
      };
      reader.readAsDataURL(file);
      setFileName(file.name);
    } else {
      setPreview(null);
      setFileName('');
      onFileSelect(null, null);
    }
  }, [onFileSelect]);

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    handleFileChange(null);
  };

  const handleApplyGrayscale = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!preview) return;

    setIsProcessing(true);
    try {
      const grayscaleDataUrl = await convertToGrayscale(preview);
      const grayscaleFile = await dataURLtoFile(grayscaleDataUrl, `grayscale-${fileName || 'image.png'}`);
      
      setPreview(grayscaleDataUrl);
      onFileSelect(grayscaleFile, grayscaleDataUrl);
    } catch (error) {
      console.error('Error applying grayscale:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">
        {label} {isRequired && <span className="text-red-400">*</span>}
      </label>
      <div className="mt-2">
        {preview ? (
          <div className="relative group w-full h-48 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
            <img src={preview} alt="Preview" className="max-h-full max-w-full object-contain rounded-md transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleApplyGrayscale}
                disabled={isProcessing}
                className="bg-gray-700 hover:bg-gray-600 text-white rounded-full p-2.5 disabled:opacity-50"
                aria-label="تطبيق فلتر أبيض وأسود"
                title="أبيض وأسود"
              >
                {isProcessing ? (
                  <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Droplets className="h-6 w-6" />
                )}
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRemoveImage}
                className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2.5"
                aria-label="شيل الصورة"
                title="حذف"
              >
                <XCircleIcon />
              </motion.button>
            </div>
          </div>
        ) : (
          <label
            htmlFor={id}
            className={`flex justify-center items-center w-full h-48 px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer hover:border-fuchsia-500 transition-colors ${isDragging ? 'border-fuchsia-500 bg-gray-700/50' : 'bg-gray-700/20'}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="space-y-1 text-center">
              <UploadIcon />
              <div className="flex text-sm text-gray-400">
                <span className="relative font-semibold text-fuchsia-400">
                  <span>ارفع صورة</span>
                  <input 
                    id={id} 
                    name={id} 
                    type="file" 
                    className="sr-only" 
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
                  />
                </span>
                <p className="pr-1">أو اسحبها وارميها هنا</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, JPEG لحد 10MB</p>
            </div>
          </label>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;