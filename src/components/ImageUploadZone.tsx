import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image, AlertCircle, Check, Loader2, RefreshCw } from 'lucide-react';
import { compressImage, formatBytes, estimateTime } from '../lib/imageUtils';

interface ImageUploadZoneProps {
  label: string;
  currentSrc?: string;
  onFileSelect: (base64: string) => void;
  onRemove: () => void;
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  onFilesSelect?: (base64Array: string[]) => void;
  key?: string | number;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

export default function ImageUploadZone({
  label,
  currentSrc,
  onFileSelect,
  onRemove,
  accept = '.jpg,.jpeg,.png,.webp,.svg',
  maxSizeMB = 5,
  multiple = false,
  onFilesSelect
}: ImageUploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentSrc || null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'compressing' | 'done' | 'error'>('idle');
  const [originalSize, setOriginalSize] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setError(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Invalid file type. Accepted: JPG, PNG, WEBP, SVG');
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File exceeds ${maxSizeMB}MB limit`);
      return;
    }
    setUploading(true);
    setStatus('compressing');
    setOriginalSize(file.size);
    setProgress(0);
    try {
      const result = await compressImage(file, (pct) => setProgress(pct));
      setProgress(100);
      setStatus('done');
      setPreview(result.dataUrl);
      onFileSelect(result.dataUrl);
      setTimeout(() => { setUploading(false); setStatus('idle'); }, 800);
    } catch (err) {
      setError('Compression failed. Uploading original.');
      setStatus('error');
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        onFileSelect(reader.result as string);
        setUploading(false);
        setTimeout(() => setStatus('idle'), 1000);
      };
      reader.readAsDataURL(file);
    }
  }, [maxSizeMB, onFileSelect]);

  const processMultiple = useCallback(async (files: FileList) => {
    const results: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!ACCEPTED_TYPES.includes(file.type)) continue;
      if (file.size > maxSizeMB * 1024 * 1024) continue;
      setUploading(true);
      setStatus('compressing');
      setProgress(0);
      try {
        const result = await compressImage(file, (pct) => setProgress(pct));
        results.push(result.dataUrl);
      } catch {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        results.push(dataUrl);
      }
    }
    setProgress(100);
    setStatus('done');
    onFilesSelect?.(results);
    setTimeout(() => { setUploading(false); setStatus('idle'); setProgress(0); }, 800);
  }, [maxSizeMB, onFilesSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    if (multiple && onFilesSelect && files.length > 1) {
      processMultiple(files);
    } else {
      processFile(files[0]);
    }
  }, [processFile, processMultiple, multiple, onFilesSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragOver(false);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (multiple && onFilesSelect && files.length > 1) {
      processMultiple(files);
    } else {
      processFile(files[0]);
    }
    if (inputRef.current) inputRef.current.value = '';
  }, [processFile, processMultiple, multiple, onFilesSelect]);

  const handleRemove = useCallback(() => {
    setPreview(null); setError(null); setStatus('idle'); setProgress(0);
    onRemove();
    if (inputRef.current) inputRef.current.value = '';
  }, [onRemove]);

  const handleRetry = useCallback(() => {
    setError(null); setStatus('idle'); setProgress(0);
    inputRef.current?.click();
  }, []);

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
        {label}{multiple ? ` (${multiple ? 'multi' : 'single'})` : ''}
      </label>

      {preview && !multiple ? (
        <div className="relative bg-[#0A0A0A] border border-[#2D2D2D] rounded-lg overflow-hidden group">
          <img src={preview} alt={label} className="w-full h-36 object-contain" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button type="button" onClick={() => inputRef.current?.click()} className="p-2 bg-[#F5B942] text-[#0A0A0A] rounded-full hover:bg-white transition cursor-pointer" title="Replace image"><Upload className="w-4 h-4" /></button>
            <button type="button" onClick={handleRemove} className="p-2 bg-[#E8332A] text-white rounded-full hover:bg-red-500 transition cursor-pointer" title="Remove image"><X className="w-4 h-4" /></button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-[#F5B942] bg-[#F5B942]/10' : 'border-[#2D2D2D] bg-[#0A0A0A] hover:border-[#F5B942]/50'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              {status === 'compressing' && <Loader2 className="w-8 h-8 animate-spin text-[#F5B942]" />}
              {status === 'done' && <Check className="w-8 h-8 text-green-400" />}
              {status === 'error' && <AlertCircle className="w-8 h-8 text-red-400" />}
              <div className="w-full max-w-[200px] bg-[#2D2D2D] rounded-full h-2 overflow-hidden">
                <div className="h-full bg-[#F5B942] transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex items-center justify-between w-full max-w-[200px]">
                <span className="font-mono text-[10px] text-gray-500">
                  {status === 'compressing' ? 'Compressing...' : status === 'done' ? 'Complete' : 'Failed'}
                </span>
                <span className="font-mono text-[10px] text-gray-500">{progress}%</span>
              </div>
              {originalSize > 0 && status === 'compressing' && (
                <span className="font-mono text-[9px] text-gray-600">{formatBytes(originalSize)} • ~{estimateTime(originalSize)}</span>
              )}
              {status === 'error' && (
                <button type="button" onClick={handleRetry} className="flex items-center gap-1 text-[10px] font-mono text-red-400 hover:text-red-300 transition cursor-pointer bg-transparent border-0">
                  <RefreshCw className="w-3 h-3" /> Retry
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Image className="w-8 h-8 text-gray-500" />
              <span className="font-mono text-xs text-gray-400">Drag & drop or click to upload</span>
              <span className="font-mono text-[10px] text-gray-600">
                {multiple ? 'Select multiple files' : 'JPG, PNG, WEBP, SVG'} (max {maxSizeMB}MB)
              </span>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        multiple={multiple}
        className="hidden"
      />

      {error && (
        <div className="flex items-center gap-1.5 p-2 bg-red-900/40 border border-red-500/50 rounded text-red-200 text-[10px] font-mono">
          <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />
          <span>{error}</span>
          <button type="button" onClick={handleRetry} className="ml-auto text-red-300 hover:text-red-200 underline cursor-pointer bg-transparent border-0 p-0 font-mono text-[10px]">Retry</button>
        </div>
      )}
    </div>
  );
}
