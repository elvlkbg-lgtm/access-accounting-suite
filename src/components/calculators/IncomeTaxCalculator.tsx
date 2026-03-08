import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Child deduction: 6000 BGN per child per year = ~3067.75 EUR (1.9558 rate)
const CHILD_DEDUCTION = 3067.75;
const DISABILITY_DEDUCTION = 7920 / 1.9558; // ~4050.41 EUR

export default function IncomeTaxCalculator() {
  const [income, setIncome] = useState('');
  const [children, setChildren] = useState('0');
  const [hasDisability, setHasDisability] = useState(false);
  const [expenseType, setExpenseType] = useState('0');
  const [result, setResult] = useState<any>(null);

  const EXPENSE_RATES: Record<string, { label: string; rate: number }> = {
    '0': { label: 'Без (трудови доходи)', rate: 0 },
    '25': { label: '25% — стандартни', rate: 0.25 },
    '40': { label: '40% — авторски и изобретения', rate: 0.40 },
    '60': { label: '60% — занаяти', rate: 0.60 },
  };

  const calculate = () => {
    const annualIncome = parseFloat(income);
    if (isNaN(annualIncome) || annualIncome <= 0) return;

    const numChildren = parseInt(children) || 0;
    const expRate = EXPENSE_RATES[expenseType].rate;

    const recognizedExpenses = annualIncome * expRate;
    const incomeAfterExpenses = annualIncome - recognizedExpenses;

    const childDeduction = numChildren * CHILD_DEDUCTION;
    const disabilityDeduction = hasDisability ? DISABILITY_DEDUCTION : 0;
    const totalDeductions = childDeduction + disabilityDeduction;

    const taxableIncome = Math.max(0, incomeAfterExpenses - totalDeductions);
    const tax = Math.round(taxableIncome * 0.10 * 100) / 100;
    const effectiveRate = annualIncome > 0 ? (tax / annualIncome) * 100 : 0;

    setResult({
      annualIncome,
      recognizedExpenses,
      incomeAfterExpenses,
      childDeduction,
      disabilityDeduction,
      totalDeductions,
      taxableIncome,
      tax,
      netIncome: annualIncome - tax,
      effectiveRate,
      numChildren,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Годишен доход (€)</Label>
        <Input type="number" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="Напр. 20000" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Нормативни разходи</Label>
          <Select value={expenseType} onValueChange={setExpenseType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(EXPENSE_RATES).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Брой деца</Label>
          <Select value={children} onValueChange={setChildren}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Без деца</SelectItem>
              <SelectItem value="1">1 дете</SelectItem>
              <SelectItem value="2">2 деца</SelectItem>
              <SelectItem value="3">3 деца</SelectItem>
              <SelectItem value="4">4+ деца</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{CHILD_DEDUCTION.toFixed(2)} € приспадане на дете/год.</p>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={hasDisability} onChange={(e) => setHasDisability(e.target.checked)} className="rounded" />
        ТЕЛК 50%+ (облекчение {DISABILITY_DEDUCTION.toFixed(2)} €/год.)
      </label>

      <Button onClick={calculate} disabled={!income} className="w-full">Изчисли данък</Button>

      {result && (
        <div className="mt-4 space-y-3 rounded-lg border bg-card p-4">
          <h4 className="font-semibold">Данък общ доход</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Годишен доход:</span>
            <span>{result.annualIncome.toFixed(2)} €</span>
            {result.recognizedExpenses > 0 && (
              <>
                <span className="text-muted-foreground">Признати разходи:</span>
                <span>−{result.recognizedExpenses.toFixed(2)} €</span>
              </>
            )}
            <span className="text-muted-foreground">Доход след разходи:</span>
            <span>{result.incomeAfterExpenses.toFixed(2)} €</span>
            {result.childDeduction > 0 && (
              <>
                <span className="text-muted-foreground">Облекчение деца ({result.numChildren}):</span>
                <span>−{result.childDeduction.toFixed(2)} €</span>
              </>
            )}
            {result.disabilityDeduction > 0 && (
              <>
                <span className="text-muted-foreground">ТЕЛК облекчение:</span>
                <span>−{result.disabilityDeduction.toFixed(2)} €</span>
              </>
            )}
            <span className="text-muted-foreground font-medium">Облагаем доход:</span>
            <span className="font-medium">{result.taxableIncome.toFixed(2)} €</span>
          </div>

          <div className="border-t pt-3">
            <div className="flex items-center justify-between text-lg font-bold text-primary">
              <span>Данък (10%):</span>
              <span>{result.tax.toFixed(2)} €</span>
            </div>
            <div className="flex items-center justify-between font-medium mt-1">
              <span>Ефективна ставка:</span>
              <span>{result.effectiveRate.toFixed(2)}%</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span>Чист доход след данък:</span>
              <span>{result.netIncome.toFixed(2)} €</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Ставки 2026 г. ЗДДФЛ, чл. 48. Цени в евро.</p>
        </div>
      )}
    </div>
  );
}
