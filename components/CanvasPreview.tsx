
import React, { useEffect, useRef, useState } from 'react';
import { BrandingAsset } from '../types';

interface CanvasPreviewProps {
  baseImageUrl: string;
  asset: BrandingAsset | null;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

const CanvasPreview: React.FC<CanvasPreviewProps> = ({ baseImageUrl, asset, onCanvasReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = baseImageUrl;
    img.onload = () => {
      setBaseImage(img);
      setImageLoaded(true);
    };
  }, [baseImageUrl]);

  useEffect(() => {
    if (asset?.type === 'image' && asset.content) {
      const img = new Image();
      img.src = asset.content;
      img.onload = () => setLogoImage(img);
    } else {
      setLogoImage(null);
    }
  }, [asset]);

  useEffect(() => {
    if (!canvasRef.current || !baseImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed internal resolution for consistent editing
    canvas.width = 1024;
    canvas.height = 1024;

    // Draw background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

    // Draw overlay
    if (asset) {
      ctx.save();
      const centerX = (asset.position.x / 100) * canvas.width;
      const centerY = (asset.position.y / 100) * canvas.height;
      
      if (asset.type === 'image' && logoImage) {
        const logoWidth = (canvas.width * 0.3) * asset.scale;
        const logoHeight = (logoImage.height / logoImage.width) * logoWidth;
        ctx.drawImage(logoImage, centerX - logoWidth / 2, centerY - logoHeight / 2, logoWidth, logoHeight);
      } else if (asset.type === 'text') {
        const fontSize = (asset.fontSize || 40) * (canvas.width / 1000) * asset.scale;
        ctx.font = `${fontSize}px "${asset.fontFamily || 'Inter'}"`;
        ctx.fillStyle = asset.color || '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(asset.content, centerX, centerY);
      }
      ctx.restore();
    }

    onCanvasReady?.(canvas);
  }, [baseImage, asset, logoImage, onCanvasReady]);

  return (
    <div className="relative w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full object-contain"
      />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white text-[10px] uppercase tracking-widest font-bold">
        Live AI Preview
      </div>
    </div>
  );
};

export default CanvasPreview;
