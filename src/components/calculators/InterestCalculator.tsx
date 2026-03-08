import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

// OLP rates per half-year period (BNB base rate + 10 percentage points)
// Legal interest = (OLP + 10%) annual, daily = annual / 360
const OLP_PERIODS = [
  { from: '2024-07-01', to: '2024-12-31', olp: 3.63 },
  { from: '2025-01-01', to: '2025-06-30', olp: 3.40 },
  { from: '2025-07-01', to: '2025-12-31', olp: 3.15 },
  { from: '2026-01-01', to: '2026-06-30', olp: 2.87 },
  { from: '2026-07-01', to: '2026-12-31', olp: 2.87 },
];

function getOlpForDate(date: Date): number {
  const ds = date.toISOString().slice(0, 10);
  for (const p of OLP_PERIODS) {
    if (ds >= p.from && ds <= p.to) return p.olp;
  }
  // fallback to latest
  return OLP_PERIODS[OLP_PERIODS.length - 1].olp;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export default function InterestCalculator() {
  const [amount, setAmount] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const a = parseFloat(amount);
    if (isNaN(a) || a <= 0 || !fromDate || !toDate) return;

    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (to <= from) return;

    // Calculate interest day by day, accounting for OLP changes
    let totalInterest = 0;
    const current = new Date(from);
    const periods: { from: string; to: string; olp: number; days: number; interest: number }[] = [];
    let periodStart = new Date(current);
    let prevOlp = getOlpForDate(current);
    let periodDays = 0;
    let periodInterest = 0;

    while (current <= to) {
      const olp = getOlpForDate(current);
      if (olp !== prevOlp) {
        // save previous period
        periods.push({
          from: periodStart.toISOString().slice(0, 10),
          to: new Date(current.getTime() - 86400000).toISOString().slice(0, 10),
          olp: prevOlp,
          days: periodDays,
          interest: periodInterest,
        });
        periodStart = new Date(current);
        periodDays = 0;
        periodInterest = 0;
        prevOlp = olp;
      }
      const annualRate = (olp + 10) / 100;
      const dailyRate = annualRate / 360;
      const dayInterest = a * dailyRate;
      totalInterest += dayInterest;
      periodInterest += dayInterest;
      periodDays++;
      current.setDate(current.getDate() + 1);
    }

    // push last period
    if (periodDays > 0) {
      periods.push({
        from: periodStart.toISOString().slice(0, 10),
        to: to.toISOString().slice(0, 10),
        olp: prevOlp,
        days: periodDays,
        interest: periodInterest,
      });
    }

    const totalDays = daysBetween(from, to) + 1;

    setResult({
      amount: a,
      totalInterest,
      totalWithInterest: a + totalInterest,
      totalDays,
      periods,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Дължима сума (€)</Label>
        <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Напр. 1000" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>От дата (начало на забавата)</Label>
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>До дата</Label>
          <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Законна лихва = (ОЛП на БНБ + 10%) годишно, дневна = 1/360 от годишната. Просто олихвяване.
      </p>

      <Button onClick={calculate} disabled={!amount || !fromDate || !toDate} className="w-full">Изчисли лихва</Button>

      {result && (
        <div className="mt-4 space-y-3 rounded-lg border bg-card p-4">
          <h4 className="font-semibold">Резултат</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Главница:</span>
            <span>{result.amount.toFixed(2)} €</span>
            <span className="text-muted-foreground">Дни просрочие:</span>
            <span>{result.totalDays}</span>
          </div>

          {result.periods.length > 1 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">По периоди:</p>
              {result.periods.map((p: any, i: number) => (
                <div key={i} className="text-xs grid grid-cols-3 gap-1">
                  <span>{p.from} — {p.to}</span>
                  <span>ОЛП: {p.olp}% ({p.days} дни)</span>
                  <span className="text-right">{p.interest.toFixed(2)} €</span>
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-3 space-y-1">
            <div className="flex items-center justify-between font-medium">
              <span>Законна лихва:</span>
              <span>{result.totalInterest.toFixed(2)} €</span>
            </div>
            <div className="flex items-center justify-between text-lg font-bold text-primary">
              <span>Общо дължимо:</span>
              <span>{result.totalWithInterest.toFixed(2)} €</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Източник: ПМС №426/2014 г. Лихви върху лихви не се дължат.
          </p>
        </div>
      )}
    </div>
  );
}
