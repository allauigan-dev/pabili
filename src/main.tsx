import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// ============================================
// SERVICE WORKER REGISTRATION & MANAGEMENT
// ============================================

// Utility methods exposed globally for debugging/testing
declare global {
  interface Window {
    pwaUtils: {
      checkForUpdate: () => Promise<void>;
      clearCache: () => Promise<void>;
      syncNow: () => Promise<void>;
      getVersion: () => Promise<string>;
    };
  }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none', // Always check for SW updates
      });

      console.log('[PWA] Service Worker registered:', registration.scope);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        if (newWorker) {
          console.log('[PWA] New Service Worker installing...');

          newWorker.addEventListener('statechange', () => {
            console.log('[PWA] New SW state:', newWorker.state);

            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New version available while old SW was controlling
                showUpdateNotification(newWorker);
              } else {
                // First install - content cached for offline
                console.log('[PWA] Content cached for offline use');
              }
            }
          });
        }
      });

      // Handle SW controlling page
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          console.log('[PWA] New Service Worker took control, reloading...');
          window.location.reload();
        }
      });

      // Listen for SW messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        handleSWMessage(event.data);
      });

      // Check for updates periodically (every 60 seconds)
      setInterval(() => {
        registration.update().catch(console.error);
      }, 60 * 1000);

      // Also check on visibility change (when user returns to tab)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update().catch(console.error);
        }
      });

      // Expose utility methods for debugging
      window.pwaUtils = {
        checkForUpdate: async () => {
          try {
            await registration.update();
            console.log('[PWA] Update check complete');
          } catch (error) {
            console.error('[PWA] Update check failed:', error);
          }
        },

        clearCache: async () => {
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
          }
        },

        syncNow: async () => {
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'SYNC_NOW' });
          }
        },

        getVersion: async () => {
          return new Promise((resolve) => {
            if (navigator.serviceWorker.controller) {
              const handler = (event: MessageEvent) => {
                if (event.data.type === 'VERSION') {
                  navigator.serviceWorker.removeEventListener('message', handler);
                  resolve(event.data.version);
                }
              };
              navigator.serviceWorker.addEventListener('message', handler);
              navigator.serviceWorker.controller.postMessage({ type: 'GET_VERSION' });
            } else {
              resolve('not-installed');
            }
          });
        },
      };

      // Register periodic sync if available
      if ('periodicSync' in registration) {
        try {
          await (registration as any).periodicSync.register('sync-pending', {
            minInterval: 60 * 60 * 1000, // 1 hour
          });
          console.log('[PWA] Periodic sync registered');
        } catch (error) {
          console.log('[PWA] Periodic sync not available');
        }
      }

    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  });
}

/**
 * Show update notification to user
 */
function showUpdateNotification(newWorker: ServiceWorker) {
  // Create a styled notification banner
  const banner = document.createElement('div');
  banner.id = 'pwa-update-banner';
  banner.innerHTML = `
    <style>
      #pwa-update-banner {
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, hsl(262 83% 58%) 0%, hsl(262 83% 50%) 100%);
        color: white;
        padding: 12px 20px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10000;
        animation: slideUp 0.3s ease-out;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
      #pwa-update-banner span {
        font-size: 14px;
        font-weight: 500;
      }
      #pwa-update-banner button {
        background: white;
        color: hsl(262 83% 50%);
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s;
      }
      #pwa-update-banner button:hover {
        transform: scale(1.05);
      }
      #pwa-update-dismiss {
        background: transparent !important;
        color: white !important;
        padding: 4px 8px !important;
        opacity: 0.8;
      }
      #pwa-update-dismiss:hover {
        opacity: 1;
      }
    </style>
    <span>🎉 New version available!</span>
    <button id="pwa-update-button">Update Now</button>
    <button id="pwa-update-dismiss">✕</button>
  `;

  document.body.appendChild(banner);

  document.getElementById('pwa-update-button')?.addEventListener('click', () => {
    newWorker.postMessage({ type: 'SKIP_WAITING' });
    banner.remove();
  });

  document.getElementById('pwa-update-dismiss')?.addEventListener('click', () => {
    banner.remove();
  });
}

/**
 * Handle messages from Service Worker
 */
function handleSWMessage(data: { type: string;[key: string]: unknown }) {
  switch (data.type) {
    case 'order-synced':
      console.log('[PWA] Order synced:', data.data);
      // Could dispatch a custom event for the app to handle
      window.dispatchEvent(new CustomEvent('order-synced', { detail: data.data }));
      break;

    case 'payment-synced':
      console.log('[PWA] Payment synced:', data.data);
      window.dispatchEvent(new CustomEvent('payment-synced', { detail: data.data }));
      break;

    case 'CACHE_CLEARED':
      console.log('[PWA] Cache cleared successfully');
      break;

    case 'SYNC_COMPLETE':
      console.log('[PWA] Manual sync complete');
      break;
  }
}
