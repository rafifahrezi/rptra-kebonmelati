"use client";

import React, { useState, useCallback } from 'react';
import { Upload, X, Image, Loader2 } from 'lucide-react';

interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  contentType: string;
  size: number;
  url: string;
  category: string;
  description: string;
  alt: string;
  uploadDate: string;
}

interface GridFSUploaderProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  maxFiles?: number;
  category?: string;
  accept?: string;
  multiple?: boolean;
}

const GridFSUploader: React.FC<GridFSUploaderProps> = ({
  onFilesUploaded,
  maxFiles = 10,
  category = "general",
  accept = "image/*",
  multiple = true
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const uploadFile = async (file: File, description?: string, alt?: string): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('description', description || '');
    formData.append('alt', alt || file.name);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const result = await response.json();
    return result.file;
  };

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (uploading) return;
    
    const fileArray = Array.from(files);
    const totalFiles = uploadedFiles.length + fileArray.length;
    
    if (totalFiles > maxFiles) {
      alert(`Maksimal ${maxFiles} file yang dapat diupload`);
      return;
    }

    setUploading(true);
    const newUploadProgress: Record<string, number> = {};

    try {
      const uploadPromises = fileArray.map(async (file) => {
        const fileId = `${Date.now()}-${file.name}`;
        newUploadProgress[fileId] = 0;
        setUploadProgress(prev => ({ ...prev, ...newUploadProgress }));

        try {
          const uploadedFile = await uploadFile(file, '', file.name);
          newUploadProgress[fileId] = 100;
          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
          return uploadedFile;
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          delete newUploadProgress[fileId];
          setUploadProgress(prev => {
            const updated = { ...prev };
            delete updated[fileId];
            return updated;
          });
          throw error;
        }
      });

      const results = await Promise.all(uploadPromises);
      const newFiles = [...uploadedFiles, ...results];
      
      setUploadedFiles(newFiles);
      onFilesUploaded(newFiles);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Beberapa file gagal diupload. Silakan coba lagi.');
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  }, [uploading, uploadedFiles, maxFiles, category, onFilesUploaded]);

  const removeFile = useCallback(async (fileId: string) => {
    try {
      // Delete from GridFS
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        const newFiles = uploadedFiles.filter(f => f.id !== fileId);
        setUploadedFiles(newFiles);
        onFilesUploaded(newFiles);
      } else {
        alert('Gagal menghapus file');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Gagal menghapus file');
    }
  }, [uploadedFiles, onFilesUploaded]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
      e.target.value = ''; // Reset input
    }
  }, [handleFileUpload]);

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={uploading}
        />
        
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Upload File ke GridFS
        </h3>
        <p className="text-gray-600 mb-4">
          Drag & drop files atau{' '}
          <label
            htmlFor="file-upload"
            className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
          >
            pilih file
          </label>
        </p>
        <p className="text-sm text-gray-500">
          Maksimal {maxFiles} file, ukuran maksimal 10MB per file
        </p>
        
        {uploading && (
          <div className="mt-4">
            <Loader2 className="w-6 h-6 mx-auto animate-spin text-blue-600" />
            <p className="text-sm text-blue-600 mt-2">Mengupload file...</p>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mt-4 space-y-2">
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files Preview */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            File Terupload ({uploadedFiles.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={file.url}
                    alt={file.alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                
                <button
                  onClick={() => removeFile(file.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Hapus file"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.originalName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GridFSUploader;