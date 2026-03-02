import { cn } from '@/lib/utils';

type OnlineStatus = 'online' | 'busy' | 'in_conversation' | 'offline';

const statusColors: Record<OnlineStatus, string> = {
  online: 'bg-green-500',
  busy: 'bg-red-500',
  in_conversation: 'bg-yellow-500',
  offline: 'bg-gray-400',
};

const statusLabels: Record<OnlineStatus, string> = {
  online: 'На линия',
  busy: 'Зает',
  in_conversation: 'В разговор',
  offline: 'Офлайн',
};

interface OnlineStatusIndicatorProps {
  status: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export default function OnlineStatusIndicator({ status, size = 'sm', showLabel = false }: OnlineStatusIndicatorProps) {
  const s = (status || 'offline') as OnlineStatus;
  const dotSize = size === 'sm' ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5';

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('rounded-full ring-2 ring-background', dotSize, statusColors[s] || statusColors.offline)} />
      {showLabel && <span className="text-xs text-muted-foreground">{statusLabels[s] || 'Офлайн'}</span>}
    </span>
  );
}
