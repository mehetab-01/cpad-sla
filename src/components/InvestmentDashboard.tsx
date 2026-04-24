import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Rectangle } from 'recharts';
import { AlertCircle, CheckCircle2, TrendingUp, DollarSign, Clock, Target, AlertTriangle } from 'lucide-react';

// Using types to enforce strictly numbers
type InstrumentData = {
  id: string;
  name: string;
  P: number; // Principal
  r: number; // Annual Rate (%)
  n: number; // Compounding Frequency
};

type GlobalInputs = {
  pTotal: number;
  timeYears: number;
  rMin: number;
};

const DEFAULT_GLOBAL: GlobalInputs = {
  pTotal: 100000,
  timeYears: 5,
  rMin: 40000,
};

const DEFAULT_INSTRUMENTS: InstrumentData[] = [
  { id: 'FD', name: 'Fixed Deposit (FD)', P: 40000, r: 6, n: 1 },
  { id: 'RD', name: 'Recurring Deposit (RD)', P: 30000, r: 7, n: 4 },
  { id: 'MF', name: 'Mutual Fund (MF)', P: 30000, r: 12, n: 12 },
];

export default function InvestmentDashboard() {
  const [globalInputs, setGlobalInputs] = useState<GlobalInputs>(DEFAULT_GLOBAL);
  const [instruments, setInstruments] = useState<InstrumentData[]>(DEFAULT_INSTRUMENTS);

  const handleGlobalChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof GlobalInputs) => {
    const val = parseFloat(e.target.value) || 0;
    setGlobalInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleInstrumentChange = (id: string, key: keyof Omit<InstrumentData, 'id'|'name'>, val: number) => {
    setInstruments(prev => prev.map(inst => inst.id === id ? { ...inst, [key]: val } : inst));
  };

  // Derived Calculations
  const calculatedData = useMemo(() => {
    const { timeYears } = globalInputs;
    return instruments.map(inst => {
      const { P, r, n } = inst;
      const rateDecimal = r / 100;
      
      const si = P * rateDecimal * timeYears;
      const ci = P * Math.pow(1 + rateDecimal / n, n * timeYears) - P;
      const finalMaturity = P + ci;

      return {
        ...inst,
        si: Math.round(si),
        ci: Math.round(ci),
        maturity: Math.round(finalMaturity),
      };
    });
  }, [instruments, globalInputs.timeYears]);

  const totals = useMemo(() => {
    return calculatedData.reduce((acc, curr) => ({
      allocatedP: acc.allocatedP + curr.P,
      totalSI: acc.totalSI + curr.si,
      totalCI: acc.totalCI + curr.ci,
    }), { allocatedP: 0, totalSI: 0, totalCI: 0 });
  }, [calculatedData]);

  // Validations
  const isCapitalValid = totals.allocatedP === globalInputs.pTotal;
  const isReturnValid = totals.totalCI >= globalInputs.rMin;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="border-b border-slate-800 pb-4 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <TrendingUp className="text-emerald-500 w-8 h-8" />
              Portfolio Model
            </h1>
            <p className="text-slate-400 mt-1">Calculate and compare SI vs CI across assets</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Inputs */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Global Settings Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg shadow-black/50">
              <h2 className="text-xl font-semibold mb-4 text-emerald-400 border-b border-slate-800 pb-2">Global Settings</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" /> Total Capital (₹)
                  </label>
                  <input 
                    type="number" 
                    value={globalInputs.pTotal} 
                    onChange={e => handleGlobalChange(e, 'pTotal')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 flex items-center gap-1">
                    <Clock className="w-4 h-4" /> Investment Period (Years)
                  </label>
                  <input 
                    type="number" 
                    value={globalInputs.timeYears} 
                    onChange={e => handleGlobalChange(e, 'timeYears')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 flex items-center gap-1">
                    <Target className="w-4 h-4" /> Min. Required Return (CI)
                  </label>
                  <input 
                    type="number" 
                    value={globalInputs.rMin} 
                    onChange={e => handleGlobalChange(e, 'rMin')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Instrument Settings */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg shadow-black/50 overflow-hidden">
              <h2 className="text-xl font-semibold mb-4 text-emerald-400 border-b border-slate-800 pb-2">Asset Allocation</h2>
              <div className="space-y-6">
                {instruments.map(inst => (
                  <div key={inst.id} className="p-4 bg-slate-950/50 rounded-lg border border-slate-800/80 hover:border-slate-700 transition duration-200">
                    <h3 className="font-medium text-white mb-3">{inst.name}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 space-y-1">
                        <label className="text-xs text-slate-400">Principal (P)</label>
                        <input 
                          type="number"
                          value={inst.P}
                          onChange={e => handleInstrumentChange(inst.id, 'P', parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-700 rounded text-sm px-2 py-1.5 focus:border-emerald-500 outline-none text-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400">Rate (r%)</label>
                        <input 
                          type="number"
                          value={inst.r}
                          onChange={e => handleInstrumentChange(inst.id, 'r', parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-700 rounded text-sm px-2 py-1.5 focus:border-emerald-500 outline-none text-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400">Frequency (n)</label>
                        <input 
                          type="number"
                          value={inst.n}
                          onChange={e => handleInstrumentChange(inst.id, 'n', parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-700 rounded text-sm px-2 py-1.5 focus:border-emerald-500 outline-none text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Results & Dash */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Capital Validation Notice */}
            {!isCapitalValid && (
              <div className="bg-rose-500/10 border border-rose-500/50 rounded-xl p-4 flex items-start gap-3 text-rose-400 animate-in fade-in slide-in-from-top-4">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-rose-300">Capital Allocation Error</h4>
                  <p className="text-sm opacity-90 mt-1">
                    Allocated capital (₹{totals.allocatedP.toLocaleString()}) must exactly match Total Capital (₹{globalInputs.pTotal.toLocaleString()}).
                  </p>
                </div>
              </div>
            )}

            {/* Content Only Shown if Capital is Valid */}
            <div className={`transition-opacity duration-300 space-y-6 ${!isCapitalValid ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
              
              {/* Validation Badge */}
              <div className={`rounded-xl p-6 border shadow-lg shadow-black/50 flex items-center gap-4 transition-colors duration-300
                ${isReturnValid 
                  ? 'bg-emerald-500/10 border-emerald-500/50' 
                  : 'bg-amber-500/10 border-amber-500/50'
                }`}>
                {isReturnValid ? (
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle className="w-12 h-12 text-amber-500 shrink-0" />
                )}
                <div>
                  <h3 className={`text-xl font-bold ${isReturnValid ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isReturnValid ? 'PASS' : 'FAIL'}: Return Target Analysis
                  </h3>
                  <p className="text-slate-300 text-sm mt-1">
                    {isReturnValid 
                      ? `Portfolio meets minimum return target (Total CI ₹${totals.totalCI.toLocaleString()} >= R_min ₹${globalInputs.rMin.toLocaleString()})`
                      : `Portfolio falls short of the target return (Total CI ₹${totals.totalCI.toLocaleString()} < R_min ₹${globalInputs.rMin.toLocaleString()})`
                    }
                  </p>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800">
                  <h3 className="font-semibold text-emerald-400 flex items-center gap-2">
                    Projected Scenario Breakdown
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-950/50 text-slate-400">
                        <th className="px-5 py-3 font-medium tracking-wider">Instrument</th>
                        <th className="px-5 py-3 font-medium tracking-wider text-right">Principal (₹)</th>
                        <th className="px-5 py-3 font-medium tracking-wider text-right">Total SI (₹)</th>
                        <th className="px-5 py-3 font-medium tracking-wider text-right text-emerald-400/80">Total CI (₹)</th>
                        <th className="px-5 py-3 font-medium tracking-wider text-right">Maturity (CI) (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {calculatedData.map(row => (
                        <tr key={row.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="px-5 py-4 font-medium text-slate-200">{row.name}</td>
                          <td className="px-5 py-4 text-right font-mono text-slate-300">{row.P.toLocaleString()}</td>
                          <td className="px-5 py-4 text-right font-mono text-slate-400">{row.si.toLocaleString()}</td>
                          <td className="px-5 py-4 text-right font-mono text-emerald-400 font-semibold">{row.ci.toLocaleString()}</td>
                          <td className="px-5 py-4 text-right font-mono text-white">{row.maturity.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-950/80 font-bold border-t border-slate-700">
                        <td className="px-5 py-4 text-emerald-500">TOTAL</td>
                        <td className="px-5 py-4 text-right font-mono text-slate-200">{totals.allocatedP.toLocaleString()}</td>
                        <td className="px-5 py-4 text-right font-mono text-slate-400">{totals.totalSI.toLocaleString()}</td>
                        <td className="px-5 py-4 text-right font-mono text-emerald-400">{totals.totalCI.toLocaleString()}</td>
                        <td className="px-5 py-4 text-right font-mono text-white">{(totals.allocatedP + totals.totalCI).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-5">
                <h3 className="font-semibold text-emerald-400 mb-6 shrink-0 flex items-center gap-2">
                  Growth Comparison (SI vs CI)
                </h3>
                <div className="h-72 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={calculatedData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="id" stroke="#64748b" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#64748b" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.5rem', color: '#f8fafc' }}
                        itemStyle={{ color: '#f8fafc' }}
                        cursor={{fill: '#1e293b', opacity: 0.4}}
                        formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, undefined]}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar 
                        dataKey="si" 
                        name="Simple Interest" 
                        fill="#334155" 
                        radius={[4, 4, 0, 0]} 
                        activeBar={<Rectangle fill="#475569" />}
                      />
                      <Bar 
                        dataKey="ci" 
                        name="Compound Interest" 
                        fill="#10b981" 
                        radius={[4, 4, 0, 0]}
                        activeBar={<Rectangle fill="#059669" />}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
