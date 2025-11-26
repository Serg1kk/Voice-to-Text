import React, { useCallback, useState, useRef } from 'react';
import { FileData } from '../types';

interface DropZoneProps {
  onFileSelected: (fileData: FileData) => void;
  disabled: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileSelected, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    
    let mimeType = file.type;
    // Normalize audio types for stability
    if (file.name.endsWith('.m4a')) {
        mimeType = 'audio/mp4'; 
    } else if (file.name.endsWith('.mp3')) {
        mimeType = 'audio/mp3';
    }

    onFileSelected({
      name: file.name,
      type: mimeType || 'audio/mp4',
      size: file.size,
      file: file
    });
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(false);
  }, [disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [disabled, onFileSelected]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`
        relative w-full rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out cursor-pointer p-10 flex flex-col items-center justify-center text-center group
        ${disabled ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50' : ''}
        ${isDragging 
          ? 'border-blue-500 bg-blue-50 scale-[1.01] shadow-lg' 
          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 bg-white shadow-sm'}
      `}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleInputChange}
        className="hidden"
        accept="audio/*,video/*,.m4a"
        disabled={disabled}
      />
      
      <div className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-blue-200 text-blue-600' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-500'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {isDragging ? 'Отпустите файл здесь' : 'Загрузите запись диктофона'}
      </h3>
      <p className="text-sm text-gray-500 max-w-xs mx-auto mb-2">
        Перетащите файл сюда или кликните для выбора. Поддерживаются большие файлы (автоматическое разделение).
      </p>
    </div>
  );
};