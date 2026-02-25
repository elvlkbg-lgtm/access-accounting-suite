import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Banknote, Receipt, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function SalaryCalculator() {
  const [gross, setGross] = useState('');
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const g = parseFloat(gross);
    if (isNaN(g) || g <= 0) return;
    const pension = g * 0.1058;
    const health = g * 0.032;
    const unemployment = g * 0.004;
    const totalEmployee = pension + health + unemployment;
    const taxBase = g - totalEmployee;
    const incomeTax = taxBase * 0.10;
    const net = g - totalEmployee - incomeTax;

    const pensionEmployer = g * 0.1272;
    const healthEmployer = g * 0.048;
    const unemploymentEmployer = g * 0.006;
    const workAccident = g * 0.007;
    const totalEmployer = pensionEmployer + healthEmployer + unemploymentEmployer + workAccident;

    setResult({ pension, health, unemployment, totalEmployee, taxBase, incomeTax, net, totalEmployer, totalCost: g + totalEmployer });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Брутна заплата (лв.)</Label>
        <Input type="number" value={gross} onChange={(e) => setGross(e.target.value)} placeholder="Напр. 2500" />
      </div>
      <Button onClick={calculate} disabled={!gross} className="w-full">Изчисли</Button>
      {result && (
        <div className="mt-4 space-y-3 rounded-lg border bg-card p-4">
          <h4 className="font-semibold">Резултат</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">ДОО (служител):</span><span>{result.pension.toFixed(2)} лв.</span>
            <span className="text-muted-foreground">ЗО (служител):</span><span>{result.health.toFixed(2)} лв.</span>
            <span className="text-muted-foreground">ДЗПО + безработица:</span><span>{result.unemployment.toFixed(2)} лв.</span>
            <span className="text-muted-foreground">Общо осигуровки:</span><span className="font-medium">{result.totalEmployee.toFixed(2)} лв.</span>
            <span className="text-muted-foreground">Данъчна основа:</span><span>{result.taxBase.toFixed(2)} лв.</span>
            <span className="text-muted-foreground">Данък (10%):</span><span>{result.incomeTax.toFixed(2)} лв.</span>
          </div>
          <div className="border-t pt-3">
            <div className="flex items-center justify-between text-lg font-bold text-primary">
              <span>Нетна заплата:</span>
              <span>{result.net.toFixed(2)} лв.</span>
            </div>
          </div>
          <div className="border-t pt-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Осигуровки работодател:</span><span>{result.totalEmployer.toFixed(2)} лв.</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Обща цена за работодател:</span><span>{result.totalCost.toFixed(2)} лв.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TaxCalculator() {
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const inc = parseFloat(income);
    const exp = parseFloat(expenses) || 0;
    if (isNaN(inc) || inc <= 0) return;
    const taxBase = Math.max(inc - exp, 0);
    const corporateTax = taxBase * 0.10;
    const netProfit = taxBase - corporateTax;
    const dividendTax = netProfit * 0.05;
    const totalTax = corporateTax + dividendTax;
    setResult({ taxBase, corporateTax, netProfit, dividendTax, totalTax, afterTax: inc - exp - totalTax });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Приходи (лв.)</Label>
        <Input type="number" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="Напр. 100000" />
      </div>
      <div className="space-y-2">
        <Label>Разходи (лв.)</Label>
        <Input type="number" value={expenses} onChange={(e) => setExpenses(e.target.value)} placeholder="Напр. 60000" />
      </div>
      <Button onClick={calculate} disabled={!income} className="w-full">Изчисли</Button>
      {result && (
        <div className="mt-4 space-y-3 rounded-lg border bg-card p-4">
          <h4 className="font-semibold">Резултат</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Данъчна основа:</span><span>{result.taxBase.toFixed(2)} лв.</span>
            <span className="text-muted-foreground">Корпоративен данък (10%):</span><span>{result.corporateTax.toFixed(2)} лв.</span>
            <span className="text-muted-foreground">Нетна печалба:</span><span>{result.netProfit.toFixed(2)} лв.</span>
            <span className="text-muted-foreground">Данък дивидент (5%):</span><span>{result.dividendTax.toFixed(2)} лв.</span>
          </div>
          <div className="border-t pt-3">
            <div className="flex items-center justify-between text-lg font-bold text-primary">
              <span>Чиста сума след данъци:</span>
              <span>{result.afterTax.toFixed(2)} лв.</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Общо данъци: {result.totalTax.toFixed(2)} лв.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function FreelancerCalculator() {
  const [income, setIncome] = useState('');
  const [normative, setNormative] = useState('25');
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const inc = parseFloat(income);
    const norm = parseFloat(normative) / 100;
    if (isNaN(inc) || inc <= 0) return;
    const recognizedExpenses = inc * norm;
    const taxBase = inc - recognizedExpenses;
    const healthInsurance = taxBase * 0.08;
    const pensionInsurance = taxBase * 0.1958;
    const totalInsurance = healthInsurance + pensionInsurance;
    const taxableBase = taxBase - totalInsurance;
    const incomeTax = taxableBase * 0.10;
    const net = inc - totalInsurance - incomeTax;
    setResult({ recognizedExpenses, taxBase, healthInsurance, pensionInsurance, totalInsurance, taxableBase, incomeTax, net });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Годишен доход (лв.)</Label>
        <Input type="number" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="Напр. 50000" />
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
      </div>
      <Button onClick={calculate} disabled={!income} className="w-full">Изчисли</Button>
      {result && (
        <div className="mt-4 space-y-3 rounded-lg border bg-card p-4">
          <h4 className="font-semibold">Резултат</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Признати разходи:</span><span>{result.recognizedExpenses.toFixed(2)} лв.</span>
            <span className="text-muted-foreground">Данъчна основа:</span><span>{result.taxBase.toFixed(2)} лв.</span>
            <span className="text-muted-foreground">Здравни осигуровки:</span><span>{result.healthInsurance.toFixed(2)} лв.</span>
            <span className="text-muted-foreground">Пенсионни осигуровки:</span><span>{result.pensionInsurance.toFixed(2)} лв.</span>
            <span className="text-muted-foreground">Данък (10%):</span><span>{result.incomeTax.toFixed(2)} лв.</span>
          </div>
          <div className="border-t pt-3">
            <div className="flex items-center justify-between text-lg font-bold text-primary">
              <span>Нетен доход:</span>
              <span>{result.net.toFixed(2)} лв.</span>
            </div>
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
          <p className="mt-2 text-muted-foreground">Бързи финансови изчисления за заплати, данъци и осигуровки</p>
        </div>

        <div className="mx-auto max-w-2xl">
          <Tabs defaultValue="salary">
            <TabsList className="mb-6 flex w-full">
              <TabsTrigger value="salary" className="flex-1 gap-1">
                <Banknote className="h-4 w-4" /> Заплата
              </TabsTrigger>
              <TabsTrigger value="tax" className="flex-1 gap-1">
                <Receipt className="h-4 w-4" /> Данъчен
              </TabsTrigger>
              <TabsTrigger value="freelancer" className="flex-1 gap-1">
                <TrendingUp className="h-4 w-4" /> Фрийлансър
              </TabsTrigger>
            </TabsList>

            <Card>
              <CardContent className="p-6">
                <TabsContent value="salary" className="mt-0">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">Калкулатор за заплати</h3>
                    <p className="text-sm text-muted-foreground">Изчислете нетната заплата от брутна</p>
                  </div>
                  <SalaryCalculator />
                </TabsContent>
                <TabsContent value="tax" className="mt-0">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">Данъчен калкулатор</h3>
                    <p className="text-sm text-muted-foreground">Корпоративен данък + данък дивидент за ЕООД/ООД</p>
                  </div>
                  <TaxCalculator />
                </TabsContent>
                <TabsContent value="freelancer" className="mt-0">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">Калкулатор за свободна професия</h3>
                    <p className="text-sm text-muted-foreground">Данъци и осигуровки за самоосигуряващи се</p>
                  </div>
                  <FreelancerCalculator />
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
