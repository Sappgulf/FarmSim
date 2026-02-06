import React, { memo, useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useTick } from '../../context/TickContext';
import { Card } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const FILTERS = ['all', 'success', 'info', 'warning', 'error'];

const TYPE_STYLES = {
  success: {
    icon: CheckCircle,
    text: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-100',
  },
  warning: {
    icon: AlertTriangle,
    text: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
  error: {
    icon: AlertCircle,
    text: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-100',
  },
  info: {
    icon: Info,
    text: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
};

const formatRelativeTime = (timestamp) => {
  const time = Number(timestamp);
  if (!Number.isFinite(time) || time <= 0) return 'Just now';

  const deltaSeconds = Math.max(0, Math.floor((Date.now() - time) / 1000));
  if (deltaSeconds < 10) return 'Just now';
  if (deltaSeconds < 60) return `${deltaSeconds}s ago`;
  if (deltaSeconds < 3600) return `${Math.floor(deltaSeconds / 60)}m ago`;
  if (deltaSeconds < 86400) return `${Math.floor(deltaSeconds / 3600)}h ago`;
  return `${Math.floor(deltaSeconds / 86400)}d ago`;
};

const NotificationCenterTab = memo(() => {
  const { state, actions } = useGame();
  useTick();
  const [activeFilter, setActiveFilter] = useState('all');

  const history = useMemo(
    () => (Array.isArray(state.notificationHistory) ? [...state.notificationHistory].reverse() : []),
    [state.notificationHistory]
  );
  const activeNotifications = Array.isArray(state.notifications) ? state.notifications : [];

  const filteredHistory = useMemo(() => (
    history.filter((entry) => activeFilter === 'all' || entry.type === activeFilter)
  ), [history, activeFilter]);

  const clearActiveNotifications = () => {
    activeNotifications.forEach((entry) => actions.clearNotification(entry.id));
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-gradient-to-r from-indigo-50 to-sky-50">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-lg font-semibold text-indigo-900">🔔 Notification Center</h3>
            <p className="text-sm text-indigo-700">Recent updates and alerts from your farm</p>
          </div>
          <Badge variant="outline" className="bg-white">
            {history.length} saved
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearActiveNotifications}
            disabled={activeNotifications.length === 0}
            className="min-h-[44px]"
          >
            Clear Active ({activeNotifications.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => actions.clearNotificationHistory()}
            disabled={history.length === 0}
            className="min-h-[44px]"
          >
            Clear History
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="font-semibold mb-3">Filters</h4>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <Button
              key={filter}
              size="sm"
              variant={activeFilter === filter ? 'default' : 'outline'}
              onClick={() => setActiveFilter(filter)}
              className="capitalize min-h-[40px]"
            >
              {filter}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="font-semibold mb-3">History</h4>
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">📭</div>
            <p className="text-gray-500">No notifications for this filter yet.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {filteredHistory.map((entry) => {
              const style = TYPE_STYLES[entry.type] || TYPE_STYLES.info;
              const Icon = style.icon;
              return (
                <div
                  key={entry.id}
                  className={`border rounded-lg p-3 ${style.bg} ${style.border}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <Icon className={`w-4 h-4 mt-0.5 ${style.text}`} />
                      <div>
                        <p className={`text-sm font-medium ${style.text}`}>{entry.message}</p>
                        {entry.details && (
                          <p className="text-xs text-gray-600 mt-1">{entry.details}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-500 whitespace-nowrap">
                      {formatRelativeTime(entry.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
});

NotificationCenterTab.displayName = 'NotificationCenterTab';

export default NotificationCenterTab;
