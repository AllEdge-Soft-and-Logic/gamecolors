import React, { useRef, useEffect } from 'react';
import { ColoringImage, DESKTOP_BP } from '../types';
import { playSound } from '../utils/audio';

interface GalleryDrawerProps {
  isOpen: boolean;
  images: ColoringImage[];
  selectedFile: string;
  onSelectImage: (image: ColoringImage) => void;
  onClose: () => void;
}

export const GalleryDrawer: React.FC<GalleryDrawerProps> = ({
  isOpen,
  images,
  selectedFile,
  onSelectImage,
  onClose,
}) => {
  const activeThumbRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (isOpen && activeThumbRef.current) {
      activeThumbRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isOpen, selectedFile]);

  const handleSelect = (img: ColoringImage) => {
    playSound('click');
    onSelectImage(img);
    if (window.innerWidth < DESKTOP_BP) {
      onClose();
    }
  };

  return (
    <aside
      id="gallery"
      className={`gallery ${isOpen ? 'open' : ''}`}
      aria-label="Coloring pages"
    >
      {images.map((img) => {
        const isActive = img.file === selectedFile;
        return (
          <img
            key={img.file}
            ref={isActive ? activeThumbRef : undefined}
            src={img.url}
            alt={img.name}
            title={img.name}
            className={isActive ? 'active' : ''}
            loading="lazy"
            decoding="async"
            onClick={() => handleSelect(img)}
          />
        );
      })}
    </aside>
  );
};
