
import React, { useState, useCallback, useEffect } from 'react';
import { 
  Sparkles, 
  Type as TypeIcon, 
  Image as ImageIcon, 
  Settings, 
  History, 
  Download, 
  Maximize, 
  Wand2,
  RefreshCw,
  LayoutGrid,
  ChevronRight,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';
import { BrandingAsset, MockupImage, ImageSize, ToolMode, FontOption } from './types';
import { INITIAL_MOCKUPS, FONTS, MOCKUP_CATEGORIES } from './constants';
import LogoUploader from './components/LogoUploader';
import CanvasPreview from './components/CanvasPreview';
import { generateMockup, editMockup } from './services/geminiService';

const App: React.FC = () => {
  // UI State
  const [activeTab, setActiveTab] = useState<ToolMode>('customize');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data State
  const [mockups, setMockups] = useState<MockupImage[]>(INITIAL_MOCKUPS);
  const [selectedMockupIndex, setSelectedMockupIndex] = useState(0);
  const [branding, setBranding] = useState<BrandingAsset>({
    type: 'text',
    content: 'BRAND NAME',
    fontFamily: FontOption.Inter,
    fontSize: 48,
    color: '#000000',
    position: { x: 50, y: 50 },
    scale: 1.0
  });

  // AI Generation Config
  const [genPrompt, setGenPrompt] = useState('A sleek coffee mug on a white marble desk');
  const [genSize, setGenSize] = useState<ImageSize>('1K');
  const [editPrompt, setEditPrompt] = useState('Add a vibrant sunset lighting');
  const [currentCanvas, setCurrentCanvas] = useState<HTMLCanvasElement | null>(null);

  const selectedMockup = mockups[selectedMockupIndex];

  // AI Key Management (for Pro model)
  const checkProKey = async () => {
    // @ts-ignore
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    }
    return true;
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await checkProKey();
      const newUrl = await generateMockup(genPrompt, genSize);
      if (newUrl) {
        const newMockup: MockupImage = {
          id: Date.now().toString(),
          url: newUrl,
          prompt: genPrompt,
          isAiGenerated: true
        };
        setMockups([newMockup, ...mockups]);
        setSelectedMockupIndex(0);
        setActiveTab('customize');
      }
    } catch (err: any) {
      if (err.message === "API_KEY_RESET_REQUIRED") {
        setError("Your AI Studio session expired. Please select your API key again.");
        // @ts-ignore
        window.aistudio?.openSelectKey();
      } else {
        setError("Failed to generate mockup. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIEnhance = async () => {
    if (!currentCanvas) return;
    setIsLoading(true);
    setError(null);
    try {
      const base64 = currentCanvas.toDataURL('image/png');
      const enhancedUrl = await editMockup(base64, editPrompt);
      if (enhancedUrl) {
        const newMockup: MockupImage = {
          id: Date.now().toString(),
          url: enhancedUrl,
          isAiGenerated: true
        };
        setMockups([newMockup, ...mockups]);
        setSelectedMockupIndex(0);
      }
    } catch (err) {
      setError("Failed to enhance mockup with AI. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = () => {
    if (!currentCanvas) return;
    const link = document.createElement('a');
    link.download = `brandvision-mockup-${Date.now()}.png`;
    link.href = currentCanvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-80' : 'w-0'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col relative z-20`}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Sparkles className="text-white" size={20} />
            </div>
            <h1 className="font-bold text-xl tracking-tight">BrandVision</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-slate-600 md:hidden">
            <ChevronLeft />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
            {(['customize', 'generate', 'edit'] as ToolMode[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[10px] font-bold uppercase tracking-wider py-2 rounded-lg transition-all ${
                  activeTab === tab 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content: Customize */}
          {activeTab === 'customize' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <LogoUploader 
                  currentLogo={branding.type === 'image' ? branding.content : null}
                  onUpload={(base64) => setBranding({ ...branding, type: 'image', content: base64 })}
                  onClear={() => setBranding({ ...branding, type: 'text', content: 'BRAND NAME' })}
                />
                
                {branding.type === 'text' && (
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700">Brand Name</label>
                    <input
                      type="text"
                      value={branding.content}
                      onChange={(e) => setBranding({ ...branding, content: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      placeholder="Enter brand name..."
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Font</label>
                        <select 
                          value={branding.fontFamily}
                          onChange={(e) => setBranding({ ...branding, fontFamily: e.target.value })}
                          className="w-full text-sm p-2 rounded-lg border border-slate-200 outline-none"
                        >
                          {FONTS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Color</label>
                        <input
                          type="color"
                          value={branding.color}
                          onChange={(e) => setBranding({ ...branding, color: e.target.value })}
                          className="w-full h-9 rounded-lg border border-slate-200 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Settings size={16} /> Placement
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-bold text-slate-500 uppercase">
                      <span>Scale</span>
                      <span>{Math.round(branding.scale * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0.1" max="3" step="0.1" 
                      value={branding.scale}
                      onChange={(e) => setBranding({ ...branding, scale: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-bold text-slate-500 uppercase">
                      <span>Horizontal Position</span>
                      <span>{Math.round(branding.position.x)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" 
                      value={branding.position.x}
                      onChange={(e) => setBranding({ ...branding, position: { ...branding.position, x: parseInt(e.target.value) } })}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-bold text-slate-500 uppercase">
                      <span>Vertical Position</span>
                      <span>{Math.round(branding.position.y)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" 
                      value={branding.position.y}
                      onChange={(e) => setBranding({ ...branding, position: { ...branding.position, y: parseInt(e.target.value) } })}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Generate */}
          {activeTab === 'generate' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">What mockup do you need?</label>
                <textarea
                  value={genPrompt}
                  onChange={(e) => setGenPrompt(e.target.value)}
                  className="w-full h-32 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-sm"
                  placeholder="E.g., A luxury coffee shop storefront in London at dusk..."
                />
                <div className="flex flex-wrap gap-2">
                  {MOCKUP_CATEGORIES.slice(0, 4).map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setGenPrompt(`A professional mockup of ${cat} in a bright studio environment`)}
                      className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-600 transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Quality</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['1K', '2K', '4K'] as ImageSize[]).map(size => (
                    <button
                      key={size}
                      onClick={() => setGenSize(size)}
                      className={`py-2 rounded-lg border text-xs font-bold transition-all ${
                        genSize === size 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm' 
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95"
              >
                {isLoading ? <RefreshCw className="animate-spin" size={20} /> : <Wand2 size={20} />}
                Generate Mockup (Nano Pro)
              </button>
              
              <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                Uses Gemini 3 Pro Image Preview for high-fidelity textures and lighting. 
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline ml-1">Requires Paid API Key</a>.
              </p>
            </div>
          )}

          {/* Tab Content: Edit */}
          {activeTab === 'edit' && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
                <AlertCircle className="text-amber-500 shrink-0" size={18} />
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  AI Edit takes your current branding and naturally blends it into the scene using Gemini 2.5 Flash Image.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Modification Prompt</label>
                <textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  className="w-full h-28 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-sm"
                  placeholder="E.g., Add a retro cinematic filter and some soft shadows..."
                />
              </div>

              <button
                onClick={handleAIEnhance}
                disabled={isLoading}
                className="w-full py-4 bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95"
              >
                {isLoading ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
                AI Enhance Render
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col bg-slate-50">
        {/* Toggle Sidebar (Mobile/Small Screens) */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-6 left-6 z-30 p-3 bg-white shadow-xl rounded-full text-indigo-600 border border-slate-100 hover:scale-110 transition-transform"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* Top Header */}
        <header className="px-8 py-4 flex items-center justify-between bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-slate-700 hidden md:block">Active Project</h2>
            <div className="h-4 w-[1px] bg-slate-200 hidden md:block"></div>
            <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full font-medium">
              {selectedMockup.isAiGenerated ? 'AI Generated' : 'Stock Asset'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={downloadImage}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Download size={16} />
              Export
            </button>
            <button className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
              <Maximize size={18} />
            </button>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 p-8 overflow-y-auto flex flex-col items-center">
          {error && (
            <div className="w-full max-w-2xl mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3">
              <AlertCircle size={20} />
              <span className="text-sm font-medium">{error}</span>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">×</button>
            </div>
          )}

          <div className="w-full max-w-2xl">
            <CanvasPreview 
              baseImageUrl={selectedMockup.url} 
              asset={branding}
              onCanvasReady={setCurrentCanvas}
            />
            
            {/* Gallery / History */}
            <div className="mt-12 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <LayoutGrid size={18} />
                  Mockup Library
                </h3>
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{mockups.length} items</span>
              </div>
              
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4 pb-8">
                {mockups.map((m, idx) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMockupIndex(idx)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-4 transition-all hover:scale-105 active:scale-95 ${
                      selectedMockupIndex === idx ? 'border-indigo-500 shadow-lg' : 'border-white shadow-sm'
                    }`}
                  >
                    <img src={m.url} alt="Mockup" className="w-full h-full object-cover" />
                    {m.isAiGenerated && (
                      <div className="absolute top-1 right-1 bg-indigo-600 text-[8px] text-white px-1 rounded uppercase font-bold">
                        AI
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Global Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white p-6">
            <div className="relative mb-8">
               <div className="w-24 h-24 border-8 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
               <Sparkles className="absolute inset-0 m-auto text-indigo-400 animate-pulse" size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Imagining your brand...</h2>
            <p className="text-indigo-100 text-center max-w-md animate-bounce">
              {activeTab === 'generate' ? "Assembling high-quality 3D textures and lighting" : "Blending pixels for a natural, photorealistic finish"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
