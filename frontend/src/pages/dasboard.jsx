import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../config/api";
import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Receipt,
  Filter,
  LayoutDashboard,
  TableProperties,
} from "lucide-react";

export default function FinanceDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
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

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await API.get("/transactions/all");
      setTransactions(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
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

  // Unique categories for the filter dropdown
  const categories = ["All", ...new Set(transactions.map((t) => t.category))];

  // Logic for Monthly Summary Table (Year | Month | Income | Expense | Net Sales)
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
    return Object.values(summary).sort((a, b) => b.year - a.year || b.month - a.month);
  };

  const totalIncome = filteredData.filter((t) => t.type === "income").reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalExpense = filteredData.filter((t) => t.type === "expense").reduce((acc, curr) => acc + Number(curr.amount), 0);
  const netProfit = totalIncome - totalExpense;

  return (
    <div className="text-white p-4 md:p-8 font-sans bg-[#050810] min-h-screen">
      
      {/* Header & Advanced Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold">Finance Dashboard</h1>
          <p className="text-zinc-500 mt-2 font-medium">Monitoring: <span className="text-emerald-400">{months.find(m => m.value === Number(filterMonth))?.name} {filterYear}</span></p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800">
          <div className="flex items-center gap-2 px-2 text-zinc-400 border-r border-zinc-800 mr-2">
            <Filter size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Filters</span>
          </div>
          
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="bg-[#0a0f1d] border border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald-500">
            {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
          </select>

          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="bg-[#0a0f1d] border border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald-500">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-[#0a0f1d] border border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald-500">
            <option value="All">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-[#0a0f1d] border border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald-500">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: "Total Income", val: totalIncome, color: "text-emerald-400", bg: "bg-emerald-500/10", icon: ArrowUpRight },
          { label: "Total Expense", val: totalExpense, color: "text-rose-400", bg: "bg-rose-500/10", icon: ArrowDownRight },
          { label: "Net Profit", val: netProfit, color: "text-white", bg: "bg-blue-500/10", icon: DollarSign },
        ].map((card, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-[#0d1425] border border-zinc-800 rounded-[2rem] p-6 relative overflow-hidden group">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{card.label}</p>
                <h2 className={`text-3xl font-black mt-2 ${card.color}`}>Rs {card.val.toLocaleString()}</h2>
              </div>
              <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center border border-white/5`}><card.icon size={28} className={card.color} /></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Monthly Summary Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#0d1425] border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl mb-10">
        <div className="p-8 border-b border-zinc-800 flex items-center gap-3">
          <LayoutDashboard className="text-blue-400" size={24} />
          <h2 className="text-xl font-bold italic">Monthly Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#050810]/50">
              <tr>
                {["Year", "Month", "Income", "Expenses", "Net Sales"].map(h => (
                  <th key={h} className="px-8 py-5 text-zinc-500 text-[10px] uppercase font-black tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {getMonthlySummary().map((row, i) => (
                <tr key={i} className="hover:bg-white/[0.02]">
                  <td className="px-8 py-5 text-sm font-bold text-zinc-300">{row.year}</td>
                  <td className="px-8 py-5 text-sm text-zinc-400">{months.find(m => m.value === row.month)?.name}</td>
                  <td className="px-8 py-5 text-sm text-emerald-400 font-bold">Rs {row.income.toLocaleString()}</td>
                  <td className="px-8 py-5 text-sm text-rose-400 font-bold">Rs {row.expense.toLocaleString()}</td>
                  <td className={`px-8 py-5 text-sm font-black ${(row.income - row.expense) >= 0 ? "text-blue-400" : "text-rose-600"}`}>
                    Rs {(row.income - row.expense).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Recent Activity Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#0d1425] border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Receipt className="text-emerald-400" size={24} />
            <h2 className="text-xl font-bold italic">Recent Activity</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#050810]/50">
              <tr>
                {["Ref ID", "Type", "Category", "Amount", "Date"].map(h => (
                  <th key={h} className="px-8 py-5 text-zinc-500 text-[10px] uppercase font-black tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-10 text-zinc-600 italic">Loading...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-10 text-zinc-600">No records found.</td></tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-emerald-500/[0.02]">
                    <td className="px-8 py-5 font-mono text-xs text-zinc-500">{item.transaction_id}</td>
                    <td className="px-8 py-5">
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${item.type === "income" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>{item.type}</span>
                    </td>
                    <td className="px-8 py-5 text-sm text-zinc-300">{item.category}</td>
                    <td className={`px-8 py-5 font-bold ${item.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>Rs {Number(item.amount).toLocaleString()}</td>
                    <td className="px-8 py-5 text-xs text-zinc-500">{item.date?.split("T")[0]}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}