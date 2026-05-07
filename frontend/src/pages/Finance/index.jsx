import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../config/api";
import {
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  Check,
  ChevronDown,
  Download,
  Filter,
  RotateCcw,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export default function FinanceDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState(["income", "expense"]);
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const catRef = useRef(null);
  const typeRef = useRef(null);

  const months = [
    { name: "January", value: 1 }, { name: "February", value: 2 },
    { name: "March", value: 3 }, { name: "April", value: 4 },
    { name: "May", value: 5 }, { name: "June", value: 6 },
    { name: "July", value: 7 }, { name: "August", value: 8 },
    { name: "September", value: 9 }, { name: "October", value: 10 },
    { name: "November", value: 11 }, { name: "December", value: 12 },
  ];

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
    const handleClickOutside = (event) => {
      if (catRef.current && !catRef.current.contains(event.target)) setShowCatDropdown(false);
      if (typeRef.current && !typeRef.current.contains(event.target)) setShowTypeDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allCategories = [...new Set(transactions.map((t) => t.category))];

  useEffect(() => {
    const filtered = transactions.filter((t) => {
      const tDate = new Date(t.date);
      const dateMatch = tDate.getMonth() + 1 === Number(filterMonth) && tDate.getFullYear() === Number(filterYear);
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(t.category);
      const typeMatch = selectedTypes.includes(t.type);
      return dateMatch && categoryMatch && typeMatch;
    });
    setFilteredData(filtered.sort((a, b) => new Date(b.date) - new Date(a.date)));
  }, [transactions, filterMonth, filterYear, selectedCategories, selectedTypes]);

  // FIXED GROWTH LOGIC FOR NEGATIVE VALUES
  const calculateGrowth = (current, previous) => {
    if (previous === 0) return current !== 0 ? 100 : 0;
    // Math.abs(previous) use pannuvadhan moolam negative numbers-il irundhu positive-ukku varum growth-ai sariyaaga calculate pannalaam
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  const getStatsForMonth = (m, y) => {
    const data = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() + 1 === m && d.getFullYear() === y;
    });
    const income = data.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    const expense = data.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount) || 0, 0);
    return { income, expense, net: income - expense };
  };

  const currentStats = getStatsForMonth(Number(filterMonth), Number(filterYear));
  const prevMonth = Number(filterMonth) === 1 ? 12 : Number(filterMonth) - 1;
  const prevYear = Number(filterMonth) === 1 ? Number(filterYear) - 1 : Number(filterYear);
  const prevStats = getStatsForMonth(prevMonth, prevYear);

  const incomeGrowth = calculateGrowth(currentStats.income, prevStats.income);
  const expenseGrowth = calculateGrowth(currentStats.expense, prevStats.expense);
  const netGrowth = calculateGrowth(currentStats.net, prevStats.net);

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedTypes(["income", "expense"]);
  };

  const downloadCSV = () => {
    const headers = ["Date,Type,Category,Amount\n"];
    const rows = filteredData.map(t => `${t.date.split('T')[0]},${t.type},${t.category},${t.amount}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `Report_${filterMonth}.csv`);
    a.click();
  };

  const StatCard = ({ title, current, growth, type }) => {
    const isNetNegative = current < 0;
    const displayColor = type === 'income' ? 'text-emerald-400' : type === 'expense' ? 'text-rose-500' : (isNetNegative ? 'text-rose-500' : 'text-emerald-400');

    return (
      <div className="bg-[#0d121f] border border-zinc-800/50 rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
         <div className={`absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl -mr-10 -mt-10`} />
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 relative z-10">{title}</p>
        <h2 className={`text-3xl font-black ${displayColor} relative z-10`}>
          Rs {current.toLocaleString()}
        </h2>
        <div className="flex items-center gap-2 mt-4 relative z-10">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${growth >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
            {growth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(growth).toFixed(1)}%
          </div>
          <span className="text-zinc-600 text-[10px] font-medium uppercase italic">vs last month</span>
        </div>
      </div>
    );
  };

  return (
    <div className=" text-zinc-200">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          Financial Dashboard
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#0d121f] p-2 rounded-2xl border border-zinc-800">
            <CalendarDays size={16} className="text-zinc-500 ml-2" />
            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="bg-transparent text-xs p-1 outline-none cursor-pointer">
              {months.map(m => <option key={m.value} value={m.value} className="bg-[#0d121f]">{m.name}</option>)}
            </select>
            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="bg-transparent text-xs p-1 outline-none cursor-pointer">
              {Array.from({ length: 5 }, (_, i) => 2024 + i).map(y => <option key={y} value={y} className="bg-[#0d121f]">{y}</option>)}
            </select>
          </div>
          <button onClick={downloadCSV} className="bg-emerald-500 text-black px-5 py-3 rounded-2xl text-xs font-black hover:bg-emerald-400 transition-all flex items-center gap-2">
            <Download size={16} /> CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Total Income" current={currentStats.income} growth={incomeGrowth} type="income" />
        <StatCard title="Total Expenses" current={currentStats.expense} growth={expenseGrowth} type="expense" />
        <StatCard title="Net Balance" current={currentStats.net} growth={netGrowth} type="net" />
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="relative" ref={typeRef}>
          <div onClick={() => setShowTypeDropdown(!showTypeDropdown)} className="bg-[#0d121f] border border-zinc-800 px-4 py-3 rounded-2xl flex items-center gap-3 cursor-pointer min-w-[150px]">
            <Filter size={14} className="text-emerald-500" />
            <span className="text-xs font-bold uppercase">Type</span>
            <ChevronDown size={14} className="ml-auto" />
          </div>
          <AnimatePresence>
            {showTypeDropdown && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute z-50 mt-2 w-full bg-[#0d121f] border border-zinc-800 rounded-2xl p-2 shadow-2xl">
                {["income", "expense"].map(type => (
                  <div key={type} onClick={() => setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl cursor-pointer">
                    <span className="text-[10px] font-black uppercase text-zinc-400">{type}</span>
                    {selectedTypes.includes(type) && <Check size={12} className="text-emerald-500" />}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" ref={catRef}>
          <div onClick={() => setShowCatDropdown(!showCatDropdown)} className="bg-[#0d121f] border border-zinc-800 px-4 py-3 rounded-2xl flex items-center gap-3 cursor-pointer min-w-[200px]">
            <Filter size={14} className="text-emerald-500" />
            <span className="text-xs font-bold uppercase">{selectedCategories.length === 0 ? "All Categories" : `${selectedCategories.length} Selected`}</span>
            <ChevronDown size={14} className="ml-auto" />
          </div>
          <AnimatePresence>
            {showCatDropdown && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute z-50 mt-2 w-full bg-[#0d121f] border border-zinc-800 rounded-2xl p-2 shadow-2xl max-h-60 overflow-y-auto border-emerald-500/20">
                {allCategories.map(cat => (
                  <div key={cat} onClick={() => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])} className="flex items-center justify-between p-2 hover:bg-emerald-500/10 rounded-xl cursor-pointer">
                    <span className="text-xs font-medium text-zinc-400">{cat}</span>
                    {selectedCategories.includes(cat) && <Check size={12} className="text-emerald-500" />}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button onClick={clearFilters} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-500 px-4 py-3 rounded-2xl text-xs font-bold hover:text-white transition-all"><RotateCcw size={14} /> RESET</button>
      </div>

      <div className="bg-[#0d121f] border border-zinc-800/50 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-950/50">
                {["Status", "Category", "Amount", "Date"].map(h => (
                  <th key={h} className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredData.length === 0 ? (
                <tr><td colSpan="4" className="py-20 text-center text-zinc-600 font-bold uppercase tracking-widest">No matching records</td></tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-all group">
                    <td className="px-8 py-5">
                      <div className={`inline-flex px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter ${item.type === 'income' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                        {item.type}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-semibold text-zinc-300">{item.category}</td>
                    <td className={`px-8 py-5 text-base font-black ${item.type === 'income' ? 'text-emerald-400' : 'text-rose-500'}`}>Rs {Number(item.amount).toLocaleString()}</td>
                    <td className="px-8 py-5 text-xs text-zinc-500 font-bold uppercase tracking-tighter">{new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}