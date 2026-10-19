import React from 'react';

interface HeaderProps {
  currentImageName?: string;
  onOpenGallery?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentImageName }) => {
  return (
    <header className="header" role="banner">
      <div className="header-title">
        <span className="header-emoji">🎨</span>
        <span className="header-text">Coloring App Pro</span>
        {currentImageName && (
          <span className="header-subtitle"> • {currentImageName}</span>
        )}
      </div>
    </header>
  );
};
