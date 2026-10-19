import React, { useState, useEffect } from 'react';

export const SplashScreen: React.FC = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div id="splash" onClick={() => setVisible(false)} role="presentation">
      <div className="logo">🎨</div>
      <h2>Coloring App Pro</h2>
    </div>
  );
};
