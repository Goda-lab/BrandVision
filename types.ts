
export type ImageSize = '1K' | '2K' | '4K';

export interface BrandingAsset {
  type: 'text' | 'image';
  content: string; // Base64 if image, string if text
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  position: { x: number; y: number };
  scale: number;
}

export interface MockupImage {
  id: string;
  url: string;
  prompt?: string;
  isAiGenerated: boolean;
}

export type ToolMode = 'generate' | 'edit' | 'customize';

export enum FontOption {
  Inter = 'Inter',
  Playfair = 'Playfair Display',
  Mono = 'Space Mono',
  Bebas = 'Bebas Neue',
  Montserrat = 'Montserrat'
}
