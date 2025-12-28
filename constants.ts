
import { FontOption } from './types';

export const INITIAL_MOCKUPS = [
  { id: '1', url: 'https://picsum.photos/seed/mug/800/800', isAiGenerated: false, prompt: 'A ceramic coffee mug on a wooden table' },
  { id: '2', url: 'https://picsum.photos/seed/tshirt/800/800', isAiGenerated: false, prompt: 'A minimalist white t-shirt on a mannequin' },
  { id: '3', url: 'https://picsum.photos/seed/van/800/800', isAiGenerated: false, prompt: 'A delivery van parked on a modern city street' },
  { id: '4', url: 'https://picsum.photos/seed/building/800/800', isAiGenerated: false, prompt: 'A glass skyscraper with a large billboard space' },
];

export const FONTS = [
  { name: 'Sans Serif', value: FontOption.Inter },
  { name: 'Serif', value: FontOption.Playfair },
  { name: 'Mono', value: FontOption.Mono },
  { name: 'Headline', value: FontOption.Bebas },
  { name: 'Modern', value: FontOption.Montserrat },
];

export const MOCKUP_CATEGORIES = [
  'Coffee Mugs',
  'T-Shirts',
  'Tote Bags',
  'Vans & Trucks',
  'Retail Buildings',
  'Billboards',
  'Business Cards',
  'Product Packaging'
];
