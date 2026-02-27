import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Banknote, Receipt, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/* ──── Bulgarian 2026 rates ──── */
const MAX_OSV = 3750; // Максимален осигурителен доход 2026
const MIN_WAGE = 1077; // Минимална работна заплата 2026

// Employee rates (3rd category, born after 1960)
const EMP = { doo: 0.0858, dzpo: 0.022, zo: 0.032, unemployment: 0.004 };
const EMP_TOTAL = EMP.doo + EMP.dzpo + EMP.zo + EMP.unemployment; // 0.1438

// Employer rates
const ER = { doo: 0.1072, dzpo: 0.028, zo: 0.048, unemployment: 0.006, tzpb: 0.005 };
const ER_TOTAL = ER.doo + ER.dzpo + ER.zo + ER.unemployment + ER.tzpb; // 0.1942

function SalaryCalculator() {
  const [gross, setGross] = useState('');
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const g = parseFloat(gross);
    if (isNaN(g) || g <= 0) return;
    const osvBase = Math.min(g, MAX_OSV);

    const empDoo = osvBase * EMP.doo;
    const empDzpo = osvBase * EMP.dzpo;
    const empZo = osvBase * EMP.zo;
    const empUnemp = osvBase * EMP.unemployment;
    const empTotal = empDoo + empDzpo + empZo + empUnemp;

    const taxBase = g - empTotal;
    const incomeTax = Math.round(taxBase * 0.10 * 100) / 100;
    const net = g - empTotal - incomeTax;

    const erDoo = osvBase * ER.doo;
    const erDzpo = osvBase * ER.dzpo;
    const erZo = osvBase * ER.zo;
    const erUnemp = osvBase * ER.unemployment;
    const erTzpb = osvBase * ER.tzpb;
    const erTotal = erDoo + erDzpo + erZo + erUnemp + erTzpb;

    setResult({ empDoo, empDzpo, empZo, empUnemp, empTotal, taxBase, incomeTax, net, erDoo, erDzpo, erZo, erUnemp, erTzpb, erTotal, totalCost: g + erTotal });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Брутна заплата (€)</Label>
        <Input type="number" value={gross} onChange={(e) => setGross(e.target.value)} placeholder={`Напр. ${MIN_WAGE}`} />
        <p className="text-xs text-muted-foreground">МРЗ 2026: {MIN_WAGE} €, Макс. ОД: {MAX_OSV} €</p>
      </div>
      <Button onClick={calculate} disabled={!gross} className="w-full">Изчисли</Button>
      {result && (
        <div className="mt-4 space-y-3 rounded-lg border bg-card p-4">
          <h4 className="font-semibold">Осигуровки служител</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">ДОО (8.58%):</span><span>{result.empDoo.toFixed(2)} €</span>
            <span className="text-muted-foreground">ДЗПО (2.2%):</span><span>{result.empDzpo.toFixed(2)} €</span>
            <span className="text-muted-foreground">ЗО (3.2%):</span><span>{result.empZo.toFixed(2)} €</span>
            <span className="text-muted-foreground">Безработица (0.4%):</span><span>{result.empUnemp.toFixed(2)} €</span>
            <span className="text-muted-foreground font-medium">Общо осигуровки:</span><span className="font-medium">{result.empTotal.toFixed(2)} €</span>
            <span className="text-muted-foreground">Данъчна основа:</span><span>{result.taxBase.toFixed(2)} €</span>
            <span className="text-muted-foreground">Данък (10%):</span><span>{result.incomeTax.toFixed(2)} €</span>
          </div>
          <div className="border-t pt-3">
            <div className="flex items-center justify-between text-lg font-bold text-primary">
              <span>Нетна заплата:</span><span>{result.net.toFixed(2)} €</span>
            </div>
          </div>
          <h4 className="font-semibold pt-2">Осигуровки работодател</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">ДОО (10.72%):</span><span>{result.erDoo.toFixed(2)} €</span>
            <span className="text-muted-foreground">ДЗПО (2.8%):</span><span>{result.erDzpo.toFixed(2)} €</span>
            <span className="text-muted-foreground">ЗО (4.8%):</span><span>{result.erZo.toFixed(2)} €</span>
            <span className="text-muted-foreground">Безработица (0.6%):</span><span>{result.erUnemp.toFixed(2)} €</span>
            <span className="text-muted-foreground">ТЗПБ (0.5%):</span><span>{result.erTzpb.toFixed(2)} €</span>
            <span className="text-muted-foreground font-medium">Общо работодател:</span><span className="font-medium">{result.erTotal.toFixed(2)} €</span>
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
      const vat = a - base;
      setResult({ base, vat, total: a });
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
          <Select value={direction} onValueChange={(v) => setDirection(v as 'add' | 'extract')}>
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

  const calculate = () => {
    const a = parseFloat(amount);
    const norm = parseFloat(normative) / 100;
    if (isNaN(a) || a <= 0) return;

    const recognized = a * norm;
    const osvBase = a - recognized;

    // If person has other insurance (e.g. labor contract), no DOO/DZPO
    const doo = hasOtherIncome ? 0 : osvBase * (EMP.doo + ER.doo);
    const dzpo = hasOtherIncome ? 0 : osvBase * (EMP.dzpo + ER.dzpo);
    const zo = osvBase * (EMP.zo + ER.zo); // always pay health
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

    setResult({ recognized, osvBase, empDoo, empDzpo, empZo, empTotal, erTotal, taxBase, incomeTax, net, totalCost: a + erTotal });
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
            <Button key={v} variant={normative === v ? 'default' : 'outline'} size="sm" onClick={() => setNormative(v)}>
              {v}%
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">25% — стандартно, 40% — авторски, 60% — занаяти</p>
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={hasOtherIncome} onChange={(e) => setHasOtherIncome(e.target.checked)} className="rounded" />
        Лицето е осигурено на друго основание (трудов договор)
      </label>
      <Button onClick={calculate} disabled={!amount} className="w-full">Изчисли</Button>
      {result && (
        <div className="mt-4 space-y-3 rounded-lg border bg-card p-4">
          <h4 className="font-semibold">Резултат</h4>
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
              <span>Нетна сума за изпълнител:</span><span>{result.net.toFixed(2)} €</span>
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
            <TabsList className="mb-6 flex w-full">
              <TabsTrigger value="salary" className="flex-1 gap-1">
                <Banknote className="h-4 w-4" /> Заплата
              </TabsTrigger>
              <TabsTrigger value="vat" className="flex-1 gap-1">
                <Receipt className="h-4 w-4" /> ДДС
              </TabsTrigger>
              <TabsTrigger value="civil" className="flex-1 gap-1">
                <FileText className="h-4 w-4" /> Граждански
              </TabsTrigger>
            </TabsList>

            <Card>
              <CardContent className="p-6">
                <TabsContent value="salary" className="mt-0">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">Калкулатор заплата — Трудов договор</h3>
                    <p className="text-sm text-muted-foreground">Брутна → нетна заплата, осигуровки служител и работодател (III кат., след 1960 г.)</p>
                  </div>
                  <SalaryCalculator />
                </TabsContent>
                <TabsContent value="vat" className="mt-0">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">ДДС Калкулатор</h3>
                    <p className="text-sm text-muted-foreground">Начислете или извлечете ДДС от сума (20%, 9%, 0%)</p>
                  </div>
                  <VATCalculator />
                </TabsContent>
                <TabsContent value="civil" className="mt-0">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">Калкулатор — Граждански договор</h3>
                    <p className="text-sm text-muted-foreground">Осигуровки и данък за изпълнител по граждански договор</p>
                  </div>
                  <CivilContractCalculator />
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
