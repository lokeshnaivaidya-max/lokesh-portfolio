export interface CompressResult {
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  format: string;
  width: number;
  height: number;
}

const MAX_DIMENSION = 2048;
const QUALITY = 0.82;

export function compressImage(file: File, onProgress?: (pct: number) => void): Promise<CompressResult> {
  return new Promise((resolve, reject) => {
    const originalSize = file.size;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        const ext = file.type === 'image/png' || file.type === 'image/svg+xml' ? file.type : 'image/webp';
        const mime = ext === 'image/svg+xml' ? 'image/svg+xml' : ext === 'image/png' ? 'image/png' : 'image/webp';
        let quality = QUALITY;
        if (file.type === 'image/png') quality = 0.75;
        if (file.type === 'image/svg+xml') {
          const svgData = reader.result as string;
          onProgress?.(100);
          resolve({
            dataUrl: svgData,
            originalSize,
            compressedSize: svgData.length,
            format: 'svg',
            width,
            height
          });
          return;
        }
        const step = (pct: number) => onProgress?.(Math.min(90, Math.round(pct * 0.9)));
        let result = '';
        let attempt = 0;
        const tryQuality = () => {
          canvas.toBlob((blob) => {
            if (!blob) { reject(new Error('Compression failed')); return; }
            const r = new FileReader();
            r.onload = () => {
              result = r.result as string;
              onProgress?.(100);
              resolve({
                dataUrl: result,
                originalSize,
                compressedSize: result.length,
                format: mime,
                width,
                height
              });
            };
            r.readAsDataURL(blob);
          }, mime, quality);
        };
        step(50);
        tryQuality();
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function estimateTime(bytes: number, speedKBps = 500): string {
  const secs = bytes / 1024 / speedKBps;
  if (secs < 1) return '<1s';
  if (secs < 60) return `${Math.ceil(secs)}s`;
  return `${Math.floor(secs / 60)}m ${Math.ceil(secs % 60)}s`;
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
