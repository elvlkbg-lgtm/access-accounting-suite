import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MIN_OSV_SOL = 550.66;
const MAX_OSV = 3750;

const INSURANCE_TYPES = {
  all_risks: { label: 'Всички рискове (вкл. ОЗМ)', doo: 0.2330, upf: 0.05, zo: 0.08 },
  pension_only: { label: 'Само пенсии', doo: 0.1980, upf: 0.05, zo: 0.08 },
  pension_no_upf: { label: 'Само пенсии (преди 1960)', doo: 0.2480, upf: 0, zo: 0.08 },
};

export default function HealthInsuranceCalculator() {
  const [income, setIncome] = useState('');
  const [months, setMonths] = useState('1');
  const [insType, setInsType] = useState<keyof typeof INSURANCE_TYPES>('all_risks');
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    let base = parseFloat(income);
    if (isNaN(base) || base <= 0) return;

    base = Math.max(MIN_OSV_SOL, Math.min(base, MAX_OSV));
    const m = parseInt(months) || 1;
    const rates = INSURANCE_TYPES[insType];

    const doo = base * rates.doo;
    const upf = base * rates.upf;
    const zo = base * rates.zo;
    const total = doo + upf + zo;

    setResult({
      base,
      doo,
      upf,
      zo,
      totalMonthly: total,
      totalPeriod: total * m,
      months: m,
      rates,
      insType,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Осигурителен доход (€)</Label>
          <Input type="number" value={income} onChange={(e) => setIncome(e.target.value)} placeholder={`Мин. ${MIN_OSV_SOL}`} />
          <p className="text-xs text-muted-foreground">Мин: {MIN_OSV_SOL} €, Макс: {MAX_OSV} €</p>
        </div>
        <div className="space-y-2">
          <Label>Брой месеци</Label>
          <Input type="number" value={months} onChange={(e) => setMonths(e.target.value)} placeholder="1" min="1" max="120" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Вид осигуряване</Label>
        <Select value={insType} onValueChange={(v) => setInsType(v as any)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(INSURANCE_TYPES).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={calculate} disabled={!income} className="w-full">Изчисли</Button>

      {result && (
        <div className="mt-4 space-y-3 rounded-lg border bg-card p-4">
          <h4 className="font-semibold">Резултат</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Осиг. доход (база):</span>
            <span>{result.base.toFixed(2)} €</span>
            <span className="text-muted-foreground">ДОО ({(result.rates.doo * 100).toFixed(2)}%):</span>
            <span>{result.doo.toFixed(2)} €</span>
            {result.upf > 0 && (
              <>
                <span className="text-muted-foreground">УПФ ({(result.rates.upf * 100).toFixed(1)}%):</span>
                <span>{result.upf.toFixed(2)} €</span>
              </>
            )}
            <span className="text-muted-foreground">Здравно ({(result.rates.zo * 100).toFixed(1)}%):</span>
            <span>{result.zo.toFixed(2)} €</span>
          </div>
          <div className="border-t pt-3">
            <div className="flex items-center justify-between text-lg font-bold text-primary">
              <span>Месечна вноска:</span>
              <span>{result.totalMonthly.toFixed(2)} €</span>
            </div>
            {result.months > 1 && (
              <div className="flex items-center justify-between font-medium mt-1">
                <span>Общо за {result.months} месеца:</span>
                <span>{result.totalPeriod.toFixed(2)} €</span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Ставки 2026 г. Източник: НАП</p>
        </div>
      )}
    </div>
  );
}
