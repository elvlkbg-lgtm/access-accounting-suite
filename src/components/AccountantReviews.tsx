import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_id: string;
  reviewer_name?: string;
}

function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'}`}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              star <= (hover || value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function AccountantReviews({ accountantId }: { accountantId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [accountantId]);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('accountant_reviews')
      .select('*')
      .eq('accountant_id', accountantId)
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      // Try to fetch reviewer names, but don't fail if RLS blocks some
      const reviewerIds = [...new Set(data.map((r) => r.reviewer_id))];
      let profileMap = new Map<string, string | null>();
      try {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', reviewerIds);
        if (profiles) {
          profileMap = new Map(profiles.map(p => [p.id, p.full_name]));
        }
      } catch (_) {
        // RLS may block some profiles - that's OK
      }

      setReviews(data.map((r) => ({
        ...r,
        reviewer_name: profileMap.get(r.reviewer_id) || 'Потребител',
      })));
    } else {
      setReviews([]);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (rating === 0) { toast.error('Моля, изберете оценка'); return; }

    setSubmitting(true);
    const insertData: any = { accountant_id: accountantId, rating, comment: comment || null };
    if (user) insertData.reviewer_id = user.id;
    const { error } = await supabase.from('accountant_reviews').insert(insertData);

    if (error) {
      toast.error('Грешка при изпращане на отзив');
    } else {
      toast.success('Отзивът е публикуван!');
      setRating(0);
      setComment('');
      fetchReviews();
    }
    setSubmitting(false);
  };

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Отзиви ({reviews.length})</span>
          {reviews.length > 0 && (
            <span className="flex items-center gap-1 text-base font-normal">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {avgRating.toFixed(1)}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Always show review form */}
        {(
          <div className="space-y-3 rounded-lg border p-4">
            <p className="text-sm font-medium">Оставете отзив</p>
            <StarRating value={rating} onChange={setRating} />
            <Textarea
              placeholder="Напишете коментар (по избор)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
            <Button onClick={handleSubmit} disabled={submitting || rating === 0} size="sm">
              {submitting ? 'Изпращане...' : 'Публикувай'}
            </Button>
          </div>
        )}

        {/* Reviews list */}
        {loading ? (
          <p className="text-sm text-muted-foreground">Зареждане...</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">Все още няма отзиви.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="border-b pb-4 last:border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{r.reviewer_name}</span>
                    <StarRating value={r.rating} readonly />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString('bg-BG')}
                  </span>
                </div>
                {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
