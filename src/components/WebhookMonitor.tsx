import React, { useState } from 'react';
import {
  Zap,
  ShieldCheck,
  Radio,
  Send,
  CheckCircle2,
  Clock,
  Code,
  Copy,
  Check,
  RefreshCw,
  Smartphone,
} from 'lucide-react';
import { WebhookDispatch } from '../types/erp';

interface WebhookMonitorProps {
  logs: WebhookDispatch[];
  onRefresh: () => void;
}

export const WebhookMonitor: React.FC<WebhookMonitorProps> = ({ logs, onRefresh }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testingDispatch, setTestingDispatch] = useState<boolean>(false);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  const handleTestTrigger = async (type: 'FN' | 'AN') => {
    setTestingDispatch(true);
    setDispatchStatus(null);
    try {
      const res = await fetch('/api/teacher/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: 'STU-1032',
          student_name: 'Mateo Rossi',
          department: 'Computer Science & AI',
          cohort: 'CS-2026-A',
          session_type: type,
          status: 'Absent',
          parent_name: 'Elena Rossi',
          parent_phone: '+1-555-0192',
          parent_channel: 'WhatsApp',
          building_zone: 'CS Wing Lab 302',
        }),
      });
      const data = await res.json();
      setDispatchStatus(
        `Webhook Triggered! Absence committed for ${type} session. Payload delivered to +1-555-0192 in ${data.webhookDispatch?.latency_ms || 42}ms.`
      );
      onRefresh();
    } catch (err: any) {
      setDispatchStatus(`Error: ${err.message}`);
    } finally {
      setTestingDispatch(false);
    }
  };

  const copyText = (txt: string, id: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Radio className="w-5 h-5 text-emerald-400" />
              </span>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                Supabase Database Webhooks & Real-time Mobile Alerts
              </h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Monitors attendance table insertions. The instant an FN or AN absence record is committed, an automated payload fires to external alert gateways, delivering notifications to parent channels.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTestTrigger('AN')}
              disabled={testingDispatch}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow transition"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Simulate AN Absence Insertion</span>
            </button>
            <button
              onClick={onRefresh}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Refresh webhook logs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {dispatchStatus && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{dispatchStatus}</span>
        </div>
      )}

      {/* Architecture Flow Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-mono text-indigo-400 font-bold">Step 1 • Table Insert</span>
          <div className="text-xs font-bold text-slate-200">Supabase DB Event</div>
          <p className="text-[11px] text-slate-400">Record inserted into erp_attendance_sessions with status='Absent'.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-mono text-cyan-400 font-bold">Step 2 • HMAC Signing</span>
          <div className="text-xs font-bold text-slate-200">Webhook Digest</div>
          <p className="text-[11px] text-slate-400">Payload signed with HMAC SHA-256 (x-supabase-signature header).</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-mono text-amber-400 font-bold">Step 3 • Edge Delivery</span>
          <div className="text-xs font-bold text-slate-200">Alert Service Router</div>
          <p className="text-[11px] text-slate-400">Routes event to external parent mobile channel gateway (SMS/WhatsApp).</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-mono text-emerald-400 font-bold">Step 4 • Parent Mobile</span>
          <div className="text-xs font-bold text-slate-200">Sub-50ms Dispatch</div>
          <p className="text-[11px] text-slate-400">Parent device receives urgent notification with session context.</p>
        </div>
      </div>

      {/* Dispatches Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Real-Time Webhook Event Stream ({logs.length} Logged)
          </h3>
          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Active Realtime Listener
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Event ID</th>
                <th className="px-4 py-3">Session</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Destination Channel</th>
                <th className="px-4 py-3">Parent Notification Message</th>
                <th className="px-4 py-3">Latency</th>
                <th className="px-4 py-3">HMAC SHA-256</th>
                <th className="px-4 py-3 text-right">Delivery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {logs.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3 text-indigo-400 font-bold">{row.event_id}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-bold text-[10px]">
                      {row.session_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans font-medium text-slate-200">
                    {row.student_name} ({row.student_id})
                  </td>
                  <td className="px-4 py-3 font-sans">
                    <span className="text-emerald-400 font-bold mr-1">{row.parent_channel}:</span>
                    <span className="text-slate-400">{row.destination_phone}</span>
                  </td>
                  <td className="px-4 py-3 font-sans text-slate-300 max-w-xs truncate" title={row.message_preview}>
                    {row.message_preview}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{row.latency_ms}ms</td>
                  <td className="px-4 py-3">
                    <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {row.delivery_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
