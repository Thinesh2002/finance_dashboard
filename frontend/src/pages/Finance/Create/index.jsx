import { useEffect, useState } from "react";
import { Loader2, PlusCircle, CheckCircle2, AlertCircle, Hash } from "lucide-react";
import API from "../../../config/api";

export default function CreateTransaction() {
  const [formData, setFormData] = useState({
    type: "income",
    category: "",
    description: "",
    amount: "",
    payment_method: "",
    date: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [nextId, setNextId] = useState("");

  const fetchNextId = async () => {
    try {
      const response = await API.get("/transactions/next-id");
      if (response.data.success) {
        setNextId(response.data.nextId);
      }
    } catch (err) {
      console.error("Error fetching next ID:", err);
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, date: today }));
    fetchNextId();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    const today = new Date().toISOString().split("T")[0];
    setFormData({
      type: "income", category: "", description: "",
      amount: "", payment_method: "", date: today,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage("");
      setError("");
      const response = await API.post("/transactions/create", formData);
      if (response.data.success) {
        setMessage(`Transaction ${nextId} Created Successfully!`);
        fetchNextId();
        resetForm();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Server error (500).");
    } finally {
      setLoading(false);
    }
  };

const inputStyle = `
w-full rounded-2xl border border-white/10 
px-5 py-4 text-sm text-zinc-200
placeholder:text-zinc-500

backdrop-blur-xl
shadow-[0_0_0_1px_rgba(255,255,255,0.03)]
transition-all duration-300 ease-out

outline-none

hover:border-emerald-500/30

hover:shadow-[0_0_25px_rgba(16,185,129,0.08)]

focus:border-emerald-500/50

focus:ring-4 focus:ring-emerald-500/10
focus:shadow-[0_0_30px_rgba(16,185,129,0.12)]

disabled:opacity-50
disabled:cursor-not-allowed
`;

  return (
    <div className="">

      <style dangerouslySetInnerHTML={{ __html: `
  
        input[type="date"]::-webkit-calendar-picker-indicator {
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 16 16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/></svg>');
          filter: none !important;
          opacity: 0.8;
          cursor: pointer;
        }

        /* Number Spinner Hide (White boxes fix) */
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none !important;
          margin: 0 !important;
        }

        input[type=number] {
          -moz-appearance: textfield !important;
        }

        /* Browser Dark Mode Calendar Popup */
        input[type="date"] {
          color-scheme: dark !important;
        }
      `}} />

      <div className="">
        <div className="relative ">
          
    

          <div className="relative z-10">
            {/* Header */}
            <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <div className="flex items-center gap-4 mb-2">
        
                  <h1 className="text-4xl font-bold text-white tracking-tighter">New Transaction</h1>
                </div>
                <p className="text-zinc-500 font-small  text-lg">Input your transaction records securely.</p>
              </div>
              
              <div className=" px-10 py-6 rounded-[2.5rem]">
                <span className="text-[10px] uppercase text-zinc-600 font-black block tracking-[0.3em] mb-1">TRANSATIONID</span>
                <div className="flex items-center gap-3 text-emerald-400">
                  <Hash size={20} className="opacity-40" />
                  <span className="font-mono font-bold text-3xl tracking-tighter">{nextId || "---"}</span>
                </div>
              </div>
            </div>

            {/* Notification Messages */}
            {message && (
              <div className="mb-10 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-3xl px-8 py-5 flex items-center gap-4">
                <CheckCircle2 size={24} />
                <span className="text-sm font-bold tracking-wide">{message}</span>
              </div>
            )}
            {error && (
              <div className="mb-10 bg-rose-500/5 border border-rose-500/20 text-rose-400 rounded-3xl px-8 py-5 flex items-center gap-4">
                <AlertCircle size={24} />
                <span className="text-sm font-bold tracking-wide">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-xs font-black text-zinc-500 ml-3 uppercase tracking-[0.2em]">Transaction Type</label>
                <select name="type" value={formData.type} onChange={handleChange} className={inputStyle}>
                  <option value="income" className="bg-black">Income Account</option>
                  <option value="expense" className="bg-black">Expense Account</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-zinc-500 ml-3 uppercase tracking-[0.2em]">Category Label</label>
                <input type="text" name="category" list="category-options" value={formData.category} onChange={handleChange} placeholder="e.g. Salary" required className={inputStyle} />
                <datalist id="category-options">
                  <option value="Daraz" /><option value="Transport" /><option value="Salary" /><option value="Food" />
                </datalist>
              </div>

              <div className="md:col-span-2 space-y-4">
                <label className="text-xs font-black text-zinc-500 ml-3 uppercase tracking-[0.2em]">Financial Details</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Context details..." className={`${inputStyle} resize-none`} />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-zinc-500 ml-3 uppercase tracking-[0.2em]">Amount ($)</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="0.00" required className={inputStyle} />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-zinc-500 ml-3 uppercase tracking-[0.2em]">Payment Gateway</label>
                <select name="payment_method" value={formData.payment_method} onChange={handleChange} className={inputStyle}>
                  <option value="" className="bg-black">Select Method</option>
                  <option value="Cash" className="bg-black">Cash</option>
                  <option value="Bank" className="bg-black">Bank</option>
                  
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-zinc-500 ml-3 uppercase tracking-[0.2em]">Posting Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required className={inputStyle} />
              </div>


              <div className="md:col-span-2 pt-10">
                <button
                  type="submit" disabled={loading}
                  className="w-full bg-white text-black font-black py-6 rounded-[2.5rem] shadow-xl flex items-center justify-center gap-4 transition-all hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-30"
                >
                  {loading ? (
                    <><Loader2 className="animate-spin" size={24} /> Processing...</>
                  ) : (
                    <>Confirm & Save Transaction</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}