import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../config/api";
import {
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers,
  Activity,
  Filter,
  Wallet,
  CalendarRange,
  History,
} from "lucide-react";

export default function FinanceDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterType, setFilterType] = useState("All");

  const months = [
    { name: "January", value: 1 }, { name: "February", value: 2 },
    { name: "March", value: 3 }, { name: "April", value: 4 },
    { name: "May", value: 5 }, { name: "June", value: 6 },
    { name: "July", value: 7 }, { name: "August", value: 8 },
    { name: "September", value: 9 }, { name: "October", value: 10 },
    { name: "November", value: 11 }, { name: "December", value: 12 },
  ];

  const years = Array.from({ length: 5 }, (_, i) => 2024 + i);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get("/transactions/all");
      setTransactions(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = transactions.filter((t) => {
      const tDate = new Date(t.date);
      const matchesDate = tDate.getMonth() + 1 === Number(filterMonth) && tDate.getFullYear() === Number(filterYear);
      const matchesCategory = filterCategory === "All" || t.category === filterCategory;
      const matchesType = filterType === "All" || t.type === filterType;
      return matchesDate && matchesCategory && matchesType;
    });
    setFilteredData(filtered);
  }, [transactions, filterMonth, filterYear, filterCategory, filterType]);

  const calculateStats = (data) => {
    const income = data.filter(t => t.type === "income").reduce((acc, t) => acc + Number(t.amount), 0);
    const expense = data.filter(t => t.type === "expense").reduce((acc, t) => acc + Number(t.amount), 0);
    return { income, expense, net: income - expense };
  };

  const currentMonthStats = calculateStats(filteredData);

  const lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonthStats = calculateStats(transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
  }));

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const last3MonthsStats = calculateStats(transactions.filter(t => new Date(t.date) >= threeMonthsAgo));

  const lifeTimeStats = calculateStats(transactions);

  const getMonthlySummary = () => {
    const summary = {};
    transactions.forEach((t) => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!summary[key]) {
        summary[key] = { year: date.getFullYear(), month: date.getMonth() + 1, income: 0, expense: 0 };
      }
      if (t.type === "income") summary[key].income += Number(t.amount);
      else summary[key].expense += Number(t.amount);
    });
    return Object.values(summary).sort((a, b) => a.year !== b.year ? b.year - a.year : a.month - b.month);
  };

  const categories = ["All", ...new Set(transactions.map((t) => t.category))];

  const StatCard = ({ title, income, expense, net, icon: Icon, color }) => (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0d121f] border border-zinc-800/50 rounded-3xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 blur-3xl -mr-10 -mt-10`} />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{title}</span>
        <div className={`p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-${color}-400`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="space-y-1 mb-4 relative z-10">
        <p className="text-xs text-zinc-400">Net Balance</p>
        <h3 className={`text-2xl font-black ${net >= 0 ? 'text-white' : 'text-rose-500'}`}>
          Rs {net.toLocaleString()}
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800/50 relative z-10">
        <div>
          <p className="text-[9px] text-zinc-500 uppercase font-bold">Income</p>
          <p className="text-emerald-400 font-bold text-sm">+{income.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[9px] text-zinc-500 uppercase font-bold">Expenses</p>
          <p className="text-rose-400 font-bold text-sm">-{expense.toLocaleString()}</p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="bg-[#05070a] min-h-screen text-zinc-200 p-4 md:p-10 font-sans">
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Financial Overview</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-zinc-500 text-sm font-medium">Live data for {months.find(m => m.value === Number(filterMonth))?.name} {filterYear}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 bg-[#0d121f] p-2 rounded-2xl border border-zinc-800">
          <div className="flex items-center gap-2 px-3 border-r border-zinc-800">
            <Filter size={14} className="text-zinc-500" />
          </div>
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="bg-transparent text-xs p-1 outline-none">
            {months.map(m => <option key={m.value} value={m.value} className="bg-[#0d121f]">{m.name}</option>)}
          </select>
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="bg-transparent text-xs p-1 outline-none">
            {years.map(y => <option key={y} value={y} className="bg-[#0d121f]">{y}</option>)}
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-transparent text-xs p-1 outline-none">
            <option value="All" className="bg-[#0d121f]">All Types</option>
            <option value="income" className="bg-[#0d121f]">Income</option>
            <option value="expense" className="bg-[#0d121f]">Expense</option>
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-transparent text-xs p-1 outline-none max-w-[100px]">
            {categories.map(c => <option key={c} value={c} className="bg-[#0d121f]">{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <StatCard title="Current Month" {...currentMonthStats} icon={Calendar} color="emerald" />
        <StatCard title="Previous Month" {...lastMonthStats} icon={History} color="blue" />
        <StatCard title="Last 3 Months" {...last3MonthsStats} icon={CalendarRange} color="purple" />
        <StatCard title="Life Time" {...lifeTimeStats} icon={Wallet} color="amber" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-[#0d121f] border border-zinc-800/50 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="px-8 py-6 border-b border-zinc-800/50 flex items-center gap-3">
              <Layers size={20} className="text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Monthly Summary</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-900/30">
                    {["Year", "Month", "Income", "Expenses", "Net Profit"].map(h => (
                      <th key={h} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {getMonthlySummary().map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-4 text-sm font-bold text-zinc-400">{row.year}</td>
                      <td className="px-8 py-4 text-sm font-medium text-zinc-200">{months.find(m => m.value === row.month)?.name}</td>
                      <td className="px-8 py-4 text-sm text-emerald-400 font-bold">Rs {row.income.toLocaleString()}</td>
                      <td className="px-8 py-4 text-sm text-rose-400 font-bold">Rs {row.expense.toLocaleString()}</td>
                      <td className={`px-8 py-4 text-sm font-black ${(row.income - row.expense) >= 0 ? "text-emerald-400" : "text-rose-500"}`}>
                        Rs {(row.income - row.expense).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#0d121f] border border-zinc-800/50 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="px-8 py-6 border-b border-zinc-800/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity size={20} className="text-blue-400" />
                <h2 className="text-lg font-bold text-white">Recent Transactions</h2>
              </div>
              <span className="text-[10px] bg-zinc-800 px-3 py-1 rounded-full font-bold text-zinc-400">{filteredData.length} Records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-900/30">
                    {["Type", "Category", "Amount", "Date"].map(h => (
                      <th key={h} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {loading ? (
                    <tr><td colSpan="4" className="py-12 text-center text-zinc-600 italic">Processing...</td></tr>
                  ) : filteredData.length === 0 ? (
                    <tr><td colSpan="4" className="py-12 text-center text-zinc-600 italic">No transactions found for this period</td></tr>
                  ) : (
                    filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.01]">
                        <td className="px-8 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${item.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-500'}`}>
                            {item.type === 'income' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                            {item.type}
                          </div>
                        </td>
                        <td className="px-8 py-4 text-sm font-medium text-zinc-300">{item.category}</td>
                        <td className={`px-8 py-4 text-sm font-black ${item.type === 'income' ? 'text-emerald-400' : 'text-rose-500'}`}>
                          Rs {Number(item.amount).toLocaleString()}
                        </td>
                        <td className="px-8 py-4 text-xs text-zinc-500 font-medium">{item.date?.split("T")[0]}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2.5rem] p-8 text-white shadow-xl">
            <h3 className="text-xl font-black mb-2">Smart Insights</h3>
            <p className="text-emerald-100 text-sm leading-relaxed mb-6 opacity-90">
              Your highest spending category this month is <span className="font-bold underline text-white">{filteredData.filter(t => t.type === 'expense').sort((a,b) => b.amount - a.amount)[0]?.category || 'N/A'}</span>.
            </p>
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
              <p className="text-[10px] uppercase font-bold opacity-70 mb-1">Savings Goal</p>
              <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full w-[65%]" />
              </div>
              <p className="text-right text-[10px] mt-2 font-bold">65% Achieved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}