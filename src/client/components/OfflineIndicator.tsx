import { useOnlineStatus, useOfflineStorage, useSyncListener } from '../hooks/useOfflineStorage';
import { useState } from 'react';
import { WifiOff, CloudUpload, Check } from 'lucide-react';

interface OfflineIndicatorProps {
    className?: string;
}

export function OfflineIndicator({ className = '' }: OfflineIndicatorProps) {
    const isOnline = useOnlineStatus();
    const { pendingCount: orderCount, refresh: refreshOrders } = useOfflineStorage('pending-orders');
    const { pendingCount: paymentCount, refresh: refreshPayments } = useOfflineStorage('pending-payments');
    const [syncedMessage, setSyncedMessage] = useState<string | null>(null);

    const totalPending = orderCount + paymentCount;

    // Listen for sync events
    useSyncListener((type) => {
        if (type === 'order-synced') {
            refreshOrders();
            setSyncedMessage('Order synced!');
        } else if (type === 'payment-synced') {
            refreshPayments();
            setSyncedMessage('Payment synced!');
        }

        // Clear message after 3 seconds
        setTimeout(() => setSyncedMessage(null), 3000);
    });

    // Don't show anything if online and no pending items
    if (isOnline && totalPending === 0 && !syncedMessage) {
        return null;
    }

    return (
        <div className={`offline-indicator ${className}`}>
            {/* Success message when items sync */}
            {syncedMessage && (
                <div className="offline-indicator__toast offline-indicator__toast--success">
                    <Check size={16} />
                    <span>{syncedMessage}</span>
                </div>
            )}

            {/* Offline status bar */}
            {!isOnline && (
                <div className="offline-indicator__bar offline-indicator__bar--offline">
                    <WifiOff size={16} />
                    <span>You're offline</span>
                </div>
            )}

            {/* Pending sync items */}
            {isOnline && totalPending > 0 && (
                <div className="offline-indicator__bar offline-indicator__bar--syncing">
                    <CloudUpload size={16} className="offline-indicator__sync-icon" />
                    <span>Syncing {totalPending} item{totalPending > 1 ? 's' : ''}...</span>
                </div>
            )}

            <style>{`
        .offline-indicator {
          position: fixed;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
        }

        .offline-indicator__bar,
        .offline-indicator__toast {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 24px;
          font-size: 13px;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .offline-indicator__bar--offline {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .offline-indicator__bar--syncing {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
        }

        .offline-indicator__toast--success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .offline-indicator__sync-icon {
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
        </div>
    );
}

// Mini indicator for the header/nav area
export function OnlineStatusDot() {
    const isOnline = useOnlineStatus();

    return (
        <div
            className="online-status-dot"
            title={isOnline ? 'Online' : 'Offline'}
            style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: isOnline ? '#10b981' : '#ef4444',
                boxShadow: isOnline
                    ? '0 0 8px rgba(16, 185, 129, 0.5)'
                    : '0 0 8px rgba(239, 68, 68, 0.5)',
            }}
        />
    );
}
