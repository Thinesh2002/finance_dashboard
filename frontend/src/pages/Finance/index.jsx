import { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../config/api";
import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Wallet,
  Receipt,
  Filter,
  CalendarDays,
} from "lucide-react";

export default function FinanceDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State - Default to Current Month and Year
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  const months = [
    { name: "January", value: 1 }, { name: "February", value: 2 },
    { name: "March", value: 3 }, { name: "April", value: 4 },
    { name: "May", value: 5 }, { name: "June", value: 6 },
    { name: "July", value: 7 }, { name: "August", value: 8 },
    { name: "September", value: 9 }, { name: "October", value: 10 },
    { name: "November", value: 11 }, { name: "December", value: 12 },
  ];

  const years = Array.from({ length: 5 }, (_, i) => 2025 + i);

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
      return (
        tDate.getMonth() + 1 === Number(filterMonth) &&
        tDate.getFullYear() === Number(filterYear)
      );
    });
    setFilteredData(filtered);
  }, [transactions, filterMonth, filterYear]);

  // Calculations for Filtered Data
  const totalIncome = filteredData
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const totalExpense = filteredData
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const netProfit = totalIncome - totalExpense;

  // Chart Data
  const chartData = [
    ["Type", "Amount"],
    ["Income", totalIncome],
    ["Expense", totalExpense],
  ];

  const chartOptions = {
    pieHole: 0.4,
    backgroundColor: "transparent",
    colors: ["#10b981", "#f43f5e"],
    legend: { textStyle: { color: "#9ca3af", fontSize: 12 } },
    chartArea: { width: "90%", height: "90%" },
    pieSliceBorderColor: "transparent",
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-[#050810] text-white p-4 md:p-8 font-sans">
      {/* Header & Filter Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent italic">
            Finance Dashboard
          </h1>
          <p className="text-zinc-500 mt-2 font-medium">
            Monitoring current month: <span className="text-emerald-400">{months.find(m => m.value === Number(filterMonth))?.name} {filterYear}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-zinc-900/50 p-2 rounded-2xl border border-zinc-800">
          <div className="flex items-center gap-2 px-3 text-zinc-400">
            <Filter size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Filters</span>
          </div>
          
          <select 
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="bg-[#0a0f1d] border border-zinc-800 rounded-xl px-4 py-2 text-sm outline-none focus:border-emerald-500 transition-all"
          >
            {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
          </select>

          <select 
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="bg-[#0a0f1d] border border-zinc-800 rounded-xl px-4 py-2 text-sm outline-none focus:border-emerald-500 transition-all"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: "Income", val: totalIncome, color: "text-emerald-400", bg: "bg-emerald-500/10", icon: ArrowUpRight },
          { label: "Expense", val: totalExpense, color: "text-rose-400", bg: "bg-rose-500/10", icon: ArrowDownRight },
          { label: "Net Profit", val: netProfit, color: "text-white", bg: "bg-blue-500/10", icon: DollarSign },
        ].map((card, idx) => (
          <motion.div
            key={card.label}
            variants={cardVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: idx * 0.1 }}
            className="bg-[#0d1425] border border-zinc-800 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 ${card.bg} blur-3xl rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700`} />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{card.label}</p>
                <h2 className={`text-3xl font-black mt-2 ${card.color}`}>
                  Rs {card.val.toLocaleString()}
                </h2>
              </div>
              <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center border border-white/5`}>
                <card.icon size={28} className={card.color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Google Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-1 bg-[#0d1425] border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <CalendarDays className="text-emerald-400" />
            <h2 className="text-xl font-bold italic">Monthly Structure</h2>
          </div>
          <div className="h-[300px] flex items-center justify-center">
            {filteredData.length > 0 ? (
              <Chart
                chartType="PieChart"
                data={chartData}
                options={chartOptions}
                width={"100%"}
                height={"100%"}
              />
            ) : (
              <p className="text-zinc-600 italic">No data to chart</p>
            )}
          </div>
        </motion.div>

        {/* Recent Transactions Table */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-2 bg-[#0d1425] border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl"
        >
          <div className="p-8 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Receipt className="text-emerald-400" size={24} />
              <h2 className="text-xl font-bold italic">Recent Activity</h2>
            </div>
            <span className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-[10px] font-bold tracking-tighter uppercase">
              {filteredData.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#050810]/50">
                <tr>
                  {["Ref ID", "Type", "Category", "Amount", "Date"].map(h => (
                    <th key={h} className="text-left px-8 py-5 text-zinc-500 text-[10px] uppercase font-black tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                <AnimatePresence>
                  {loading ? (
                    <tr><td colSpan="5" className="text-center py-20 text-zinc-600 italic">Processing data...</td></tr>
                  ) : filteredData.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-20 text-zinc-600 italic tracking-widest">NO RECORDS FOR THIS MONTH</td></tr>
                  ) : (
                    filteredData.map((item, idx) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-emerald-500/[0.02] transition-colors group"
                      >
                        <td className="px-8 py-5 font-mono text-xs text-zinc-400 group-hover:text-emerald-400 transition-colors">
                          {item.transaction_id}
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                            item.type === "income" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-sm font-medium text-zinc-300">{item.category}</td>
                        <td className={`px-8 py-5 font-bold ${item.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                          Rs {Number(item.amount).toLocaleString()}
                        </td>
                        <td className="px-8 py-5 text-xs text-zinc-500 font-medium">
                          {item.date?.split("T")[0]}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}