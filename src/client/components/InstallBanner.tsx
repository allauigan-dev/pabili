import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { Download, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface InstallBannerProps {
  delay?: number; // Delay in ms before showing the banner
}

export function InstallBanner({ delay = 30000 }: InstallBannerProps) {
  const { isInstallable, isInstalled, promptInstall, dismissPrompt } = useInstallPrompt();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      // Re-show after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
        return;
      }
    }

    // Show banner after delay
    if (isInstallable && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isDismissed, delay]);

  const handleInstall = async () => {
    const outcome = await promptInstall();
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    dismissPrompt();
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't render if installed, not installable, dismissed, or not visible
  if (isInstalled || !isInstallable || isDismissed || !isVisible) {
    return null;
  }

  return (
    <div className="install-banner">
      <div className="install-banner__content">
        <div className="install-banner__icon">
          <Download size={22} />
        </div>
        <div className="install-banner__text">
          <strong>Install Pabili</strong>
          <span>Get quick access from your home screen</span>
        </div>
      </div>
      <div className="install-banner__actions">
        <button
          className="install-banner__install-btn"
          onClick={handleInstall}
        >
          Install
        </button>
        <button
          className="install-banner__dismiss-btn"
          onClick={handleDismiss}
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>
      </div>

      <style>{`
        .install-banner {
          position: fixed;
          bottom: 80px;
          left: 16px;
          right: 16px;
          background: hsl(220 26% 17%);
          border: 1px solid hsl(215 19% 27%);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          z-index: 9998;
          animation: slideUp 0.4s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .install-banner__content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .install-banner__icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, hsl(262 83% 58%) 0%, hsl(262 83% 50%) 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 4px 12px hsla(262 83% 58% / 0.3);
        }

        .install-banner__text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .install-banner__text strong {
          font-size: 15px;
          font-weight: 600;
          color: hsl(210 20% 98%);
        }

        .install-banner__text span {
          font-size: 13px;
          color: hsl(218 11% 65%);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .install-banner__actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .install-banner__install-btn {
          padding: 10px 20px;
          background: linear-gradient(135deg, hsl(262 83% 58%) 0%, hsl(262 83% 50%) 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px hsla(262 83% 58% / 0.3);
        }

        .install-banner__install-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px hsla(262 83% 58% / 0.4);
        }

        .install-banner__install-btn:active {
          transform: translateY(0);
        }

        .install-banner__dismiss-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: hsl(218 11% 65%);
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .install-banner__dismiss-btn:hover {
          background: hsl(215 19% 27%);
          color: hsl(210 20% 98%);
        }

        @media (max-width: 400px) {
          .install-banner {
            flex-direction: column;
            align-items: stretch;
          }

          .install-banner__actions {
            justify-content: center;
            padding-top: 8px;
          }

          .install-banner__dismiss-btn {
            position: absolute;
            top: 8px;
            right: 8px;
          }
        }
      `}</style>
    </div>
  );
}
