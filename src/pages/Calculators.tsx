import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Banknote, Receipt, FileText, HeartPulse, Percent, Calculator } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HealthInsuranceCalculator from '@/components/calculators/HealthInsuranceCalculator';
import InterestCalculator from '@/components/calculators/InterestCalculator';
import IncomeTaxCalculator from '@/components/calculators/IncomeTaxCalculator';

/* ──── Bulgarian 2026 rates ──── */
const MAX_OSV = 3750;
const MIN_WAGE = 1077;

// Rates by labor category
const RATES = {
  '3': {
    emp: { doo: 0.0858, dzpo: 0.022, zo: 0.032, unemployment: 0.004 },
    er: { doo: 0.1072, dzpo: 0.028, zo: 0.048, unemployment: 0.006, tzpb: 0.005 },
  },
  '2': {
    emp: { doo: 0.0858, dzpo: 0.022, zo: 0.032, unemployment: 0.004 },
    er: { doo: 0.1072, dzpo: 0.028, zo: 0.048, unemployment: 0.006, tzpb: 0.007 },
  },
  '1': {
    emp: { doo: 0.0858, dzpo: 0.022, zo: 0.032, unemployment: 0.004 },
    er: { doo: 0.1072, dzpo: 0.028, zo: 0.048, unemployment: 0.006, tzpb: 0.011 },
  },
};

// Born before 1960 — no DZPO
const RATES_BEFORE_1960 = {
  emp: { doo: 0.1058, dzpo: 0, zo: 0.032, unemployment: 0.004 },
  er: { doo: 0.1322, dzpo: 0, zo: 0.048, unemployment: 0.006, tzpb: 0.005 },
};

function SalaryCalculator() {
  const [calcType, setCalcType] = useState<'gross' | 'net'>('gross');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<'1' | '2' | '3'>('3');
  const [bornBefore1960, setBornBefore1960] = useState(false);
  const [seniority, setSeniority] = useState('0');
  const [workDays, setWorkDays] = useState('21');
  const [workedDays, setWorkedDays] = useState('21');
  const [paidLeave, setPaidLeave] = useState('0');
  const [sickDaysEmployer, setSickDaysEmployer] = useState('0');
  const [sickDaysNoi, setSickDaysNoi] = useState('0');
  const [hasDisability, setHasDisability] = useState(false);
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const a = parseFloat(amount);
    if (isNaN(a) || a <= 0) return;

    const seniorityPct = parseFloat(seniority) || 0;
    const totalWorkDays = parseInt(workDays) || 21;
    const actualWorked = parseInt(workedDays) || totalWorkDays;
    const paidLeaveDays = parseInt(paidLeave) || 0;
    const sickEmp = parseInt(sickDaysEmployer) || 0;
    const sickNoi = parseInt(sickDaysNoi) || 0;

    const rates = bornBefore1960
      ? { emp: RATES_BEFORE_1960.emp, er: { ...RATES_BEFORE_1960.er, tzpb: RATES[category].er.tzpb } }
      : RATES[category];

    const empTotal = rates.emp.doo + rates.emp.dzpo + rates.emp.zo + rates.emp.unemployment;
    const erTotal = rates.er.doo + rates.er.dzpo + rates.er.zo + rates.er.unemployment + rates.er.tzpb;

    let gross: number;
    if (calcType === 'gross') {
      gross = a;
    } else {
      // Net to gross: net = gross - gross*empRate - (gross - gross*empRate)*0.10 + disability deduction
      // net = gross * (1 - empRate) * (1 - 0.10) + (hasDisability ? gross*empRate*0.10_adjustment : 0)
      // Simplified: net = gross * (1 - empRate) * 0.9
      // gross = net / ((1 - empRate) * 0.9)
      const factor = (1 - empTotal) * 0.9;
      if (hasDisability) {
        // With disability: tax base reduced by 7920/12 = 660
        // net = gross - empOsig - max(0, (gross - empOsig - 660) * 0.10)
        // Solve iteratively
        gross = a / factor; // initial estimate
        for (let i = 0; i < 10; i++) {
          const osvBase = Math.min(gross, MAX_OSV);
          const empOsig = osvBase * empTotal;
          const taxBase = Math.max(0, gross - empOsig - 660);
          const tax = Math.round(taxBase * 0.10 * 100) / 100;
          const net = gross - empOsig - tax;
          const diff = net - a;
          if (Math.abs(diff) < 0.01) break;
          gross -= diff;
        }
      } else {
        gross = a / factor;
      }
    }

    // Apply seniority bonus
    const seniorityBonus = gross * (seniorityPct / 100);
    const totalGross = gross + seniorityBonus;

    // Proportional pay based on worked days
    const payableDays = actualWorked + paidLeaveDays;
    const proportionalGross = totalWorkDays > 0 ? (totalGross * payableDays) / totalWorkDays : totalGross;

    const osvBase = Math.min(proportionalGross, MAX_OSV);

    const empDoo = osvBase * rates.emp.doo;
    const empDzpo = osvBase * rates.emp.dzpo;
    const empZo = osvBase * rates.emp.zo;
    const empUnemp = osvBase * rates.emp.unemployment;
    const empOsig = empDoo + empDzpo + empZo + empUnemp;

    let taxBase = proportionalGross - empOsig;
    if (hasDisability) taxBase = Math.max(0, taxBase - 660);
    const incomeTax = Math.round(taxBase * 0.10 * 100) / 100;
    const net = proportionalGross - empOsig - incomeTax;

    // Sick pay (employer pays 70% for first 3 days)
    const dailyGross = totalWorkDays > 0 ? totalGross / totalWorkDays : 0;
    const sickPayEmployer = sickEmp * dailyGross * 0.70;

    const erDoo = osvBase * rates.er.doo;
    const erDzpo = osvBase * rates.er.dzpo;
    const erZo = osvBase * rates.er.zo;
    const erUnemp = osvBase * rates.er.unemployment;
    const erTzpb = osvBase * rates.er.tzpb;
    const erOsig = erDoo + erDzpo + erZo + erUnemp + erTzpb;

    setResult({
      gross: totalGross,
      proportionalGross,
      seniorityBonus,
      empDoo, empDzpo, empZo, empUnemp, empOsig,
      taxBase: proportionalGross - empOsig,
      disabilityDeduction: hasDisability ? 660 : 0,
      taxableBase: taxBase,
      incomeTax,
      net,
      sickPayEmployer,
      erDoo, erDzpo, erZo, erUnemp, erTzpb, erOsig,
      totalCost: proportionalGross + erOsig + sickPayEmployer,
      payableDays,
      totalWorkDays,
      bornBefore1960,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Тип изчисление</Label>
          <Select value={calcType} onValueChange={(v) => setCalcType(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="gross">Брутно → Нетно</SelectItem>
              <SelectItem value="net">Нетно → Брутно</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{calcType === 'gross' ? 'Брутна заплата (€)' : 'Нетна заплата (€)'}</Label>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Напр. ${calcType === 'gross' ? MIN_WAGE : '900'}`} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Категория труд</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Трета (стандартна)</SelectItem>
              <SelectItem value="2">Втора</SelectItem>
              <SelectItem value="1">Първа</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Доплащане за стаж (%)</Label>
          <Input type="number" value={seniority} onChange={(e) => setSeniority(e.target.value)} placeholder="0" min="0" step="0.6" />
          <p className="text-xs text-muted-foreground">0.6% за година стаж</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Работни дни в месеца</Label>
          <Input type="number" value={workDays} onChange={(e) => setWorkDays(e.target.value)} placeholder="21" />
        </div>
        <div className="space-y-2">
          <Label>Отработени дни</Label>
          <Input type="number" value={workedDays} onChange={(e) => setWorkedDays(e.target.value)} placeholder="21" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label>Платен отпуск (дни)</Label>
          <Input type="number" value={paidLeave} onChange={(e) => setPaidLeave(e.target.value)} placeholder="0" />
        </div>
        <div className="space-y-2">
          <Label>Болнични работодател</Label>
          <Input type="number" value={sickDaysEmployer} onChange={(e) => setSickDaysEmployer(e.target.value)} placeholder="0" />
          <p className="text-xs text-muted-foreground">Първите 3 дни</p>
        </div>
        <div className="space-y-2">
          <Label>Болнични НОИ</Label>
          <Input type="number" value={sickDaysNoi} onChange={(e) => setSickDaysNoi(e.target.value)} placeholder="0" />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={bornBefore1960} onChange={(e) => setBornBefore1960(e.target.checked)} className="rounded" />
          Роден(а) преди 1960 г.
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={hasDisability} onChange={(e) => setHasDisability(e.target.checked)} className="rounded" />
          ТЕЛК 50%+ (данъчно облекчение)
        </label>
      </div>

      <p className="text-xs text-muted-foreground">МРЗ 2026: {MIN_WAGE} €, Макс. ОД: {MAX_OSV} €</p>
      <Button onClick={calculate} disabled={!amount} className="w-full">Изчисли</Button>

      {result && (
        <div className="mt-4 space-y-3 rounded-lg border bg-card p-4">
          <h4 className="font-semibold">Фиш за заплата</h4>
          {result.seniorityBonus > 0 && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Основна заплата:</span><span>{(result.gross - result.seniorityBonus).toFixed(2)} €</span>
              <span className="text-muted-foreground">Клас (стаж):</span><span>+{result.seniorityBonus.toFixed(2)} €</span>
              <span className="text-muted-foreground font-medium">Брутна заплата:</span><span className="font-medium">{result.gross.toFixed(2)} €</span>
            </div>
          )}
          {result.payableDays < result.totalWorkDays && (
            <p className="text-xs text-muted-foreground">Дни: {result.payableDays} от {result.totalWorkDays} → пропорционално: {result.proportionalGross.toFixed(2)} €</p>
          )}

          <h4 className="font-semibold pt-2">Осигуровки служител</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">ДОО ({(result.bornBefore1960 ? 10.58 : 8.58)}%):</span><span>{result.empDoo.toFixed(2)} €</span>
            {!result.bornBefore1960 && <><span className="text-muted-foreground">ДЗПО (2.2%):</span><span>{result.empDzpo.toFixed(2)} €</span></>}
            <span className="text-muted-foreground">ЗО (3.2%):</span><span>{result.empZo.toFixed(2)} €</span>
            <span className="text-muted-foreground">Безработица (0.4%):</span><span>{result.empUnemp.toFixed(2)} €</span>
            <span className="text-muted-foreground font-medium">Общо осигуровки:</span><span className="font-medium">{result.empOsig.toFixed(2)} €</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Данъчна основа:</span><span>{result.taxBase.toFixed(2)} €</span>
            {result.disabilityDeduction > 0 && (
              <><span className="text-muted-foreground">ТЕЛК облекчение:</span><span>−{result.disabilityDeduction.toFixed(2)} €</span></>
            )}
            <span className="text-muted-foreground">Облагаем доход:</span><span>{result.taxableBase.toFixed(2)} €</span>
            <span className="text-muted-foreground">Данък (10%):</span><span>{result.incomeTax.toFixed(2)} €</span>
          </div>

          <div className="border-t pt-3">
            <div className="flex items-center justify-between text-lg font-bold text-primary">
              <span>Нетна заплата:</span><span>{result.net.toFixed(2)} €</span>
            </div>
          </div>

          {result.sickPayEmployer > 0 && (
            <p className="text-sm text-muted-foreground">Болнични (работодател, 70%): {result.sickPayEmployer.toFixed(2)} €</p>
          )}

          <h4 className="font-semibold pt-2">Осигуровки работодател</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">ДОО:</span><span>{result.erDoo.toFixed(2)} €</span>
            {!result.bornBefore1960 && <><span className="text-muted-foreground">ДЗПО:</span><span>{result.erDzpo.toFixed(2)} €</span></>}
            <span className="text-muted-foreground">ЗО:</span><span>{result.erZo.toFixed(2)} €</span>
            <span className="text-muted-foreground">Безработица:</span><span>{result.erUnemp.toFixed(2)} €</span>
            <span className="text-muted-foreground">ТЗПБ:</span><span>{result.erTzpb.toFixed(2)} €</span>
            <span className="text-muted-foreground font-medium">Общо работодател:</span><span className="font-medium">{result.erOsig.toFixed(2)} €</span>
          </div>

          <div className="border-t pt-3">
            <div className="flex items-center justify-between font-bold">
              <span>Обща цена за работодател:</span><span>{result.totalCost.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VATCalculator() {
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('20');
  const [direction, setDirection] = useState<'add' | 'extract'>('add');
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const a = parseFloat(amount);
    const r = parseFloat(rate);
    if (isNaN(a) || a <= 0) return;
    if (direction === 'add') {
      const vat = a * (r / 100);
      setResult({ base: a, vat, total: a + vat });
    } else {
      const base = a / (1 + r / 100);
      setResult({ base, vat: a - base, total: a });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Сума (€)</Label>
        <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Напр. 1000" />
      </div>
      <div className="flex gap-3">
        <div className="flex-1 space-y-2">
          <Label>Ставка ДДС</Label>
          <Select value={rate} onValueChange={setRate}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="20">20%</SelectItem>
              <SelectItem value="9">9% (туризъм)</SelectItem>
              <SelectItem value="0">0%</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 space-y-2">
          <Label>Действие</Label>
          <Select value={direction} onValueChange={(v) => setDirection(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="add">Начисли ДДС</SelectItem>
              <SelectItem value="extract">Извлечи ДДС</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={calculate} disabled={!amount} className="w-full">Изчисли</Button>
      {result && (
        <div className="mt-4 space-y-3 rounded-lg border bg-card p-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Данъчна основа:</span><span>{result.base.toFixed(2)} €</span>
            <span className="text-muted-foreground">ДДС ({rate}%):</span><span>{result.vat.toFixed(2)} €</span>
          </div>
          <div className="border-t pt-3">
            <div className="flex items-center justify-between text-lg font-bold text-primary">
              <span>Крайна сума с ДДС:</span><span>{result.total.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CivilContractCalculator() {
  const [amount, setAmount] = useState('');
  const [normative, setNormative] = useState('25');
  const [hasOtherIncome, setHasOtherIncome] = useState(false);
  const [result, setResult] = useState<any>(null);

  const EMP = { doo: 0.0858, dzpo: 0.022, zo: 0.032 };
  const ER = { doo: 0.1072, dzpo: 0.028, zo: 0.048 };

  const calculate = () => {
    const a = parseFloat(amount);
    const norm = parseFloat(normative) / 100;
    if (isNaN(a) || a <= 0) return;
    const recognized = a * norm;
    const osvBase = a - recognized;
    const empDoo = hasOtherIncome ? 0 : osvBase * EMP.doo;
    const empDzpo = hasOtherIncome ? 0 : osvBase * EMP.dzpo;
    const empZo = osvBase * EMP.zo;
    const empTotal = empDoo + empDzpo + empZo;
    const erDoo = hasOtherIncome ? 0 : osvBase * ER.doo;
    const erDzpo = hasOtherIncome ? 0 : osvBase * ER.dzpo;
    const erZo = osvBase * ER.zo;
    const erTotal = erDoo + erDzpo + erZo;
    const taxBase = osvBase - empTotal;
    const incomeTax = Math.round(taxBase * 0.10 * 100) / 100;
    const net = a - empTotal - incomeTax;
    setResult({ recognized, osvBase, empTotal, erTotal, taxBase, incomeTax, net, totalCost: a + erTotal });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Сума по граждански договор (€)</Label>
        <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Напр. 2000" />
      </div>
      <div className="space-y-2">
        <Label>Нормативно признати разходи (%)</Label>
        <div className="flex gap-2">
          {['25', '40', '60'].map((v) => (
            <Button key={v} variant={normative === v ? 'default' : 'outline'} size="sm" onClick={() => setNormative(v)}>{v}%</Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">25% — стандартно, 40% — авторски, 60% — занаяти</p>
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={hasOtherIncome} onChange={(e) => setHasOtherIncome(e.target.checked)} className="rounded" />
        Лицето е осигурено на друго основание
      </label>
      <Button onClick={calculate} disabled={!amount} className="w-full">Изчисли</Button>
      {result && (
        <div className="mt-4 space-y-3 rounded-lg border bg-card p-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Признати разходи:</span><span>{result.recognized.toFixed(2)} €</span>
            <span className="text-muted-foreground">Осиг. доход:</span><span>{result.osvBase.toFixed(2)} €</span>
            <span className="text-muted-foreground">Осигуровки изпълнител:</span><span>{result.empTotal.toFixed(2)} €</span>
            <span className="text-muted-foreground">Осигуровки възложител:</span><span>{result.erTotal.toFixed(2)} €</span>
            <span className="text-muted-foreground">Данъчна основа:</span><span>{result.taxBase.toFixed(2)} €</span>
            <span className="text-muted-foreground">Данък (10%):</span><span>{result.incomeTax.toFixed(2)} €</span>
          </div>
          <div className="border-t pt-3">
            <div className="flex items-center justify-between text-lg font-bold text-primary">
              <span>Нетна сума:</span><span>{result.net.toFixed(2)} €</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Обща цена за възложител: {result.totalCost.toFixed(2)} €</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Calculators() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold md:text-4xl">Калкулатори</h1>
          <p className="mt-2 text-muted-foreground">Бързи финансови изчисления — заплати, ДДС, граждански договори (ставки 2026)</p>
        </div>
        <div className="mx-auto max-w-2xl">
          <Tabs defaultValue="salary">
            <TabsList className="mb-6 flex w-full flex-wrap">
              <TabsTrigger value="salary" className="flex-1 gap-1"><Banknote className="h-4 w-4" /> Трудов договор</TabsTrigger>
              <TabsTrigger value="civil" className="flex-1 gap-1"><FileText className="h-4 w-4" /> Граждански договор</TabsTrigger>
              <TabsTrigger value="vat" className="flex-1 gap-1"><Receipt className="h-4 w-4" /> ДДС</TabsTrigger>
              <TabsTrigger value="health" className="flex-1 gap-1"><HeartPulse className="h-4 w-4" /> Здравно</TabsTrigger>
              <TabsTrigger value="interest" className="flex-1 gap-1"><Percent className="h-4 w-4" /> Лихви</TabsTrigger>
              <TabsTrigger value="tax" className="flex-1 gap-1"><Calculator className="h-4 w-4" /> Данък</TabsTrigger>
            </TabsList>
            <Card>
              <CardContent className="p-6">
                <TabsContent value="salary" className="mt-0">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">Калкулатор заплата — Трудов договор</h3>
                    <p className="text-sm text-muted-foreground">Фиш за заплата с осигуровки, данък, стаж, отпуски и болнични</p>
                  </div>
                  <SalaryCalculator />
                </TabsContent>
                <TabsContent value="civil" className="mt-0">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">Калкулатор — Граждански договор</h3>
                    <p className="text-sm text-muted-foreground">Осигуровки и данък за изпълнител по граждански договор</p>
                  </div>
                  <CivilContractCalculator />
                </TabsContent>
                <TabsContent value="vat" className="mt-0">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">ДДС Калкулатор</h3>
                    <p className="text-sm text-muted-foreground">Начислете или извлечете ДДС от сума (20%, 9%, 0%)</p>
                  </div>
                  <VATCalculator />
                </TabsContent>
                <TabsContent value="health" className="mt-0">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">Здравноосигурителен калкулатор</h3>
                    <p className="text-sm text-muted-foreground">Вноски за самоосигуряващи се лица — ДОО, УПФ, здравно (НАП)</p>
                  </div>
                  <HealthInsuranceCalculator />
                </TabsContent>
                <TabsContent value="interest" className="mt-0">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">Лихвен калкулатор — НАП</h3>
                    <p className="text-sm text-muted-foreground">Законна лихва за просрочени задължения (ОЛП + 10 п.п.)</p>
                  </div>
                  <InterestCalculator />
                </TabsContent>
                <TabsContent value="tax" className="mt-0">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">Данъчен калкулатор</h3>
                    <p className="text-sm text-muted-foreground">Данък общ доход за физически лица с облекчения за деца и ТЕЛК</p>
                  </div>
                  <IncomeTaxCalculator />
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
