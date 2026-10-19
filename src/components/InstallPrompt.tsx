import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let promptShown = false;
    try {
      promptShown = !!localStorage.getItem('installPromptShown');
    } catch (_) {}

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!promptShown) {
        setShow(true);
        try {
          localStorage.setItem('installPromptShown', 'yes');
        } catch (_) {}
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    setShow(false);
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } catch (_) {}
    setDeferredPrompt(null);
  };

  if (!show || !deferredPrompt) return null;

  return (
    <button
      type="button"
      className="install-banner show"
      onClick={handleInstall}
      aria-label="Install App"
    >
      📲 Install App
    </button>
  );
};
