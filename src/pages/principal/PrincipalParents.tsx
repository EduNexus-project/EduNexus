import React, { useState } from 'react';
import { useERPData } from '../../context/ERPDataContext';
import { notificationService } from '../../services/notificationService';
import { useToast } from '../../context/ToastContext';
import { SearchBar } from '../../components/common/SearchBar';
import { Users, Phone, Mail, Send, BellRing, Sparkles, CheckCircle2 } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const PrincipalParents: React.FC = () => {
  const { students } = useERPData();
  const { success } = useToast();
  const [search, setSearch] = useState('');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const parents = students.map((s) => ({
    studentId: s.id,
    studentName: s.name,
    rollNumber: s.rollNumber,
    className: s.className,
    parentName: s.parentName,
    parentPhone: s.parentPhone,
    parentEmail: s.parentEmail,
    fnRate: s.fnAttendanceRate,
    anRate: s.anAttendanceRate
  }));

  const filtered = parents.filter(
    (p) =>
      p.parentName.toLowerCase().includes(search.toLowerCase()) ||
      p.studentName.toLowerCase().includes(search.toLowerCase()) ||
      p.rollNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    notificationService.dispatch({
      targetRole: 'parent',
      title: broadcastTitle,
      message: broadcastMessage,
      type: 'warning'
    });

    success('Guardian Broadcast Transmitted', `Alert dispatched to ${parents.length} registered guardians.`);
    setShowBroadcastModal(false);
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
            Guardian Communications
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Guardian Network & Parent Telemetry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated afternoon departure dispatch, emergency parent contact directory, and institutional broadcasts.
          </p>
        </div>

        <button
          onClick={() => setShowBroadcastModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Broadcast Notice to All Parents</span>
        </button>
      </div>

      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by parent name, ward name, or roll number..."
          className="w-full sm:w-80"
        />
      </div>

      {/* Parents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Guardian Name</th>
                <th className="px-5 py-3">Enrolled Ward (Student)</th>
                <th className="px-5 py-3">Class</th>
                <th className="px-5 py-3">Contact Details</th>
                <th className="px-5 py-3">Ward's Roll Status</th>
                <th className="px-5 py-3 text-right">Quick Dispatch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map((p) => {
                const hasAfternoonDrop = p.fnRate > p.anRate + 10;
                return (
                  <tr key={p.studentId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{p.parentName}</p>
                      <span className="text-[10px] text-slate-400">Primary Contact</span>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{p.studentName}</p>
                      <p className="text-[11px] font-mono text-slate-400">{p.rollNumber}</p>
                    </td>

                    <td className="px-5 py-3.5 text-slate-600 font-medium">
                      {p.className}
                    </td>

                    <td className="px-5 py-3.5 text-slate-600 space-y-0.5">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-slate-400" /> {p.parentPhone}
                      </span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <Mail className="w-3 h-3 text-slate-400" /> {p.parentEmail}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-emerald-700 font-bold">FN: {p.fnRate}%</span>
                        <span className={`font-bold ${hasAfternoonDrop ? 'text-rose-600' : 'text-blue-700'}`}>
                          AN: {p.anRate}%
                        </span>
                      </div>
                      {hasAfternoonDrop && (
                        <span className="text-[10px] font-bold text-rose-600 block mt-0.5">
                          Afternoon Skip Alert Active
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => {
                          notificationService.dispatch({
                            targetRole: 'parent',
                            title: `Dean's Direct Notice: ${p.studentName}`,
                            message: `Notice regarding afternoon session attendance for ${p.studentName} (${p.rollNumber}). Please review latest ERP log.`,
                            type: 'info'
                          });
                          success('Notice Dispatched', `SMS and ERP notification delivered to ${p.parentName}.`);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                      >
                        Notify Parent
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowBroadcastModal(false)}
          title="Institutional Guardian Broadcast"
          subtitle="This dispatch will transmit via ERP push notification and SMS gateway to all enrolled parents."
          maxWidth="md"
        >
          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Notice Title / Subject
              </label>
              <input
                type="text"
                required
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Mid-Term Examination Schedule & Lab Attendance Notice"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Notice Body / Directive
              </label>
              <textarea
                rows={4}
                required
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Enter formal communication from the Office of the Principal..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Broadcast</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
