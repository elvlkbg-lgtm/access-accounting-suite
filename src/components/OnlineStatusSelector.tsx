import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import OnlineStatusIndicator from './OnlineStatusIndicator';

const statuses = [
  { value: 'online', label: 'На линия' },
  { value: 'busy', label: 'Зает' },
  { value: 'in_conversation', label: 'В разговор' },
  { value: 'offline', label: 'Офлайн' },
] as const;

interface Props {
  currentStatus: string;
  onStatusChange?: (status: string) => void;
}

export default function OnlineStatusSelector({ currentStatus, onStatusChange }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const handleChange = async (status: string) => {
    if (!user) return;
    await supabase.from('profiles').update({ online_status: status } as any).eq('id', user.id);
    onStatusChange?.(status);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 px-2">
          <OnlineStatusIndicator status={currentStatus} size="md" showLabel />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-1">
        {statuses.map((s) => (
          <button
            key={s.value}
            className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm hover:bg-accent transition-colors"
            onClick={() => handleChange(s.value)}
          >
            <OnlineStatusIndicator status={s.value} />
            {s.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
