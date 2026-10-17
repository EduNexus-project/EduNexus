import React, { useState } from 'react';
import { X, PlusCircle, DollarSign, Building, User, FileText, Loader2, Sparkles } from 'lucide-react';

interface NewApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const NewApprovalModal: React.FC<NewApprovalModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Procurement');
  const [department, setDepartment] = useState('Computer Science & AI');
  const [requestedBy, setRequestedBy] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [justification, setJustification] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !department || !amount) {
      setError('Title, department, and amount are required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/erp/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          department,
          requested_by: requestedBy || 'Department Staff',
          amount: parseFloat(amount),
          currency: 'USD',
          description,
          justification,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create requisition');
      }

      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Quick preset loader to test interesting scenarios
  const applyPreset = (preset: 'safe' | 'highrisk' | 'academic') => {
    if (preset === 'safe') {
      setTitle('Annual Cloud Backup Vault Licensing');
      setCategory('Procurement');
      setDepartment('Information Technology');
      setRequestedBy('Sarah Miller');
      setAmount('4800');
      setDescription('12-month enterprise backup retention subscription for student records database.');
      setJustification('Standard renewal within approved department operating line item #IT-201.');
    } else if (preset === 'highrisk') {
      setTitle('Unscheduled Luxury Executive Retreat Package');
      setCategory('Expense Claim');
      setDepartment('Executive Administration');
      setRequestedBy('Gordan Vance');
      setAmount('18500');
      setDescription('3-day executive strategic symposium at Aspen lodge with hospitality catering.');
      setJustification('Leadership team alignment on multi-year strategic roadmap.');
    } else {
      setTitle('Undergraduate Quantum Computing Research Kits');
      setCategory('Procurement');
      setDepartment('Computer Science & AI');
      setRequestedBy('Dr. Aris Thorne');
      setAmount('9200');
      setDescription('5x optical cryo-simulation breadboards for CS-490 Honors thesis capstone.');
      setJustification('Co-funded by the National Science Foundation Undergraduate Fellowship.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <PlusCircle className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-slate-100">Submit New ERP Requisition</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-slate-400">Quick Test Scenarios:</span>
          <button
            type="button"
            onClick={() => applyPreset('safe')}
            className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            Standard Cloud Renewal ($4.8k)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('highrisk')}
            className="text-[10px] px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40"
          >
            Policy Violation ($18.5k)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('academic')}
            className="text-[10px] px-2.5 py-1 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/40"
          >
            Research Lab Grant ($9.2k)
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-xl text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Requisition Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Distributed Database Cluster Server"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Procurement">Procurement</option>
                <option value="Expense Claim">Expense Claim</option>
                <option value="Travel">Travel</option>
                <option value="Grant Allocation">Grant Allocation</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Department *</label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Requester Name</label>
              <input
                type="text"
                placeholder="Dr. Jordan Reed"
                value={requestedBy}
                onChange={(e) => setRequestedBy(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Amount (USD) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="15000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Technical specifications or purchase item description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Institutional Justification</label>
            <textarea
              rows={2}
              placeholder="Budget code, research grant, or critical operational need..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Save & Trigger Scoring</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
