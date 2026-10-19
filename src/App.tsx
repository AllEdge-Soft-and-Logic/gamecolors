import React, { useState, useEffect, useRef } from 'react';
import { ToolType, ColoringImage, DESKTOP_BP } from './types';
import { fetchImages } from './data/images';
import { Header } from './components/Header';
import { GalleryDrawer } from './components/GalleryDrawer';
import { ColorPalettePopup } from './components/ColorPalettePopup';
import { Toolbar } from './components/Toolbar';
import { CanvasArea, CanvasAreaHandle } from './components/CanvasArea';
import { SplashScreen } from './components/SplashScreen';
import { InstallPrompt } from './components/InstallPrompt';

export const App: React.FC = () => {
  const [tool, setTool] = useState<ToolType>('pen');
  const [color, setColor] = useState<string>('#ff0000');
  const [brushSize, setBrushSize] = useState<number>(4);
  const [images, setImages] = useState<ColoringImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<ColoringImage | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);
  const [canUndo, setCanUndo] = useState<boolean>(false);

  const canvasHandleRef = useRef<CanvasAreaHandle | null>(null);

  // Load images list
  useEffect(() => {
    let active = true;
    fetchImages().then((imgs) => {
      if (!active) return;
      setImages(imgs);
      if (imgs.length > 0) {
        // Check URL search param for initial image if present
        const params = new URLSearchParams(window.location.search);
        const imgParam = params.get('img');
        let initial = imgs[0];
        if (imgParam) {
          const match = imgs.find((i) => i.file === imgParam || i.url.includes(imgParam));
          if (match) initial = match;
        }
        setSelectedImage(initial);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  // Update body class for desktop layout responsiveness
  useEffect(() => {
    if (isGalleryOpen) {
      document.body.classList.add('gallery-open');
    } else {
      document.body.classList.remove('gallery-open');
    }
  }, [isGalleryOpen]);

  // Global keydown handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        canvasHandleRef.current?.undo();
      }
      if (e.key === 'Escape') {
        setIsPaletteOpen(false);
        setIsGalleryOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Service worker registration for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration warning:', err);
      });
    }
  }, []);

  const handleToggleGallery = () => {
    if (isPaletteOpen) setIsPaletteOpen(false);
    setIsGalleryOpen((prev) => !prev);
  };

  const handleTogglePalette = () => {
    if (isGalleryOpen && window.innerWidth < DESKTOP_BP) {
      setIsGalleryOpen(false);
    }
    setIsPaletteOpen((prev) => !prev);
  };

  return (
    <>
      <SplashScreen />

      <Header currentImageName={selectedImage?.name} />

      <CanvasArea
        ref={canvasHandleRef}
        tool={tool}
        color={color}
        brushSize={brushSize}
        imageUrl={selectedImage?.url || ''}
        isGalleryOpen={isGalleryOpen}
        onCanUndoChange={setCanUndo}
        onSelectColor={(newColor) => setColor(newColor)}
      />

      <GalleryDrawer
        isOpen={isGalleryOpen}
        images={images}
        selectedFile={selectedImage?.file || ''}
        onSelectImage={(img) => setSelectedImage(img)}
        onClose={() => setIsGalleryOpen(false)}
      />

      <ColorPalettePopup
        color={color}
        isOpen={isPaletteOpen}
        onToggle={handleTogglePalette}
        onClose={() => setIsPaletteOpen(false)}
        onSelectColor={(newColor) => setColor(newColor)}
      />

      <Toolbar
        tool={tool}
        brushSize={brushSize}
        isGalleryOpen={isGalleryOpen}
        canUndo={canUndo}
        onToggleGallery={handleToggleGallery}
        onSetTool={(t) => setTool(t)}
        onSetBrushSize={(s) => setBrushSize(s)}
        onUndo={() => canvasHandleRef.current?.undo()}
        onClear={() => canvasHandleRef.current?.clearCanvas()}
        onSave={() => canvasHandleRef.current?.saveImage()}
      />

      <InstallPrompt />
    </>
  );
};
