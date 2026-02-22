import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, ArrowLeft, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Conversation {
  partnerId: string;
  partnerName: string;
  lastMessage: string;
  lastAt: string;
  unreadCount: number;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  service_request_id: string | null;
}

export default function MessagingPanel() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<{ id: string; name: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
      // Realtime subscription
      const channel = supabase
        .channel('messaging-panel')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        }, (payload) => {
          const msg = payload.new as Message;
          if (msg.sender_id === user.id || msg.receiver_id === user.id) {
            fetchConversations();
            if (selectedPartner && (msg.sender_id === selectedPartner.id || msg.receiver_id === selectedPartner.id)) {
              setMessages(prev => [...prev, msg]);
            }
          }
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [user, selectedPartner]);

  const fetchConversations = async () => {
    if (!user) return;
    const { data: allMessages } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (!allMessages) { setLoading(false); return; }

    // Group by conversation partner
    const convMap = new Map<string, { msgs: typeof allMessages }>();
    for (const msg of allMessages) {
      const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      if (!convMap.has(partnerId)) convMap.set(partnerId, { msgs: [] });
      convMap.get(partnerId)!.msgs.push(msg);
    }

    // Fetch partner names
    const partnerIds = Array.from(convMap.keys());
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', partnerIds);

    const nameMap = new Map(profiles?.map(p => [p.id, p.full_name || 'Потребител']) || []);

    const convList: Conversation[] = partnerIds.map(pid => {
      const msgs = convMap.get(pid)!.msgs;
      return {
        partnerId: pid,
        partnerName: nameMap.get(pid) || 'Потребител',
        lastMessage: msgs[0].content,
        lastAt: msgs[0].created_at,
        unreadCount: msgs.filter(m => m.receiver_id === user.id && !m.is_read).length,
      };
    });

    convList.sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());
    setConversations(convList);
    setLoading(false);
  };

  const openConversation = async (partnerId: string, partnerName: string) => {
    setSelectedPartner({ id: partnerId, name: partnerName });
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user!.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user!.id})`)
      .order('created_at', { ascending: true });
    setMessages(data || []);

    // Mark as read
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', partnerId)
      .eq('receiver_id', user!.id)
      .eq('is_read', false);

    fetchConversations();
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedPartner) return;
    const { error } = await supabase.from('messages').insert({
      sender_id: user!.id,
      receiver_id: selectedPartner.id,
      content: newMessage,
    });
    if (error) toast.error('Грешка при изпращане');
    else {
      setNewMessage('');
      // Message will appear via realtime
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.partnerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center py-12 text-muted-foreground">Зареждане...</div>;

  // Conversation thread view
  if (selectedPartner) {
    return (
      <Card className="flex h-[600px] flex-col">
        <CardHeader className="flex-shrink-0 border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelectedPartner(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-base">{selectedPartner.name}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {messages.map((msg) => {
              const isMine = msg.sender_id === user!.id;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    isMine
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted rounded-bl-md'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className={`mt-1 text-[10px] ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {new Date(msg.created_at).toLocaleString('bg-BG', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="flex-shrink-0 border-t p-3">
          <div className="flex gap-2">
            <Textarea
              placeholder="Напишете съобщение..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 resize-none"
              rows={2}
            />
            <Button onClick={sendMessage} size="icon" className="self-end">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Conversation list
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Съобщения
        </CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Търсене..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-1 p-2">
        {filteredConversations.map((conv) => (
          <button
            key={conv.partnerId}
            onClick={() => openConversation(conv.partnerId, conv.partnerName)}
            className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
              {conv.partnerName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm truncate">{conv.partnerName}</p>
                <span className="text-[10px] text-muted-foreground flex-shrink-0">
                  {new Date(conv.lastAt).toLocaleDateString('bg-BG')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
            </div>
            {conv.unreadCount > 0 && (
              <Badge className="flex-shrink-0 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                {conv.unreadCount}
              </Badge>
            )}
          </button>
        ))}
        {filteredConversations.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {conversations.length === 0 ? 'Няма съобщения все още.' : 'Няма резултати.'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
