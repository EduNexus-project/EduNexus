import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Server,
  Database,
  Cloud,
  Terminal,
  Key,
  Copy,
  Check,
  ExternalLink,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const VercelDeploymentGuide: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const envVariables = [
    {
      name: 'GROQ_API_KEY',
      value: 'gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      purpose: 'Authenticates backend Express calls to Groq high-speed Llama-3.3-70B model.',
      whereObtained: 'console.groq.com/keys (Free tier, no card required)',
      environments: 'Production, Preview, Development',
      tier: 'Free / Zero-config',
    },
    {
      name: 'GEMINI_API_KEY',
      value: 'AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      purpose: 'Authenticates backend Express calls to Google GenAI gemini-3.8-flash model.',
      whereObtained: 'aistudio.google.com/app/apikey (Recurring Free Tier)',
      environments: 'Production, Preview, Development',
      tier: 'Free Flash-Family',
    },
    {
      name: 'SUPABASE_URL',
      value: 'https://[project-id].supabase.co',
      purpose: 'PostgreSQL cloud database REST & GraphQL API endpoint URL.',
      whereObtained: 'Supabase Dashboard -> Project Settings -> API',
      environments: 'Production, Preview, Development',
      tier: 'Supabase Free Tier',
    },
    {
      name: 'SUPABASE_ANON_KEY',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      purpose: 'Anonymous / Public client JWT token for row-level security database queries.',
      whereObtained: 'Supabase Dashboard -> Project Settings -> API (anon public key)',
      environments: 'Production, Preview, Development',
      tier: 'Supabase Free Tier',
    },
    {
      name: 'DATABASE_URL',
      value: 'postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres',
      purpose: 'Direct PostgreSQL connection URI for Express backend connection pooling.',
      whereObtained: 'Supabase Dashboard -> Project Settings -> Database -> Connection string',
      environments: 'Production, Preview, Development',
      tier: 'Supabase Free Tier',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BookOpen className="w-5 h-5" />
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Team 3: Full-Stack Vibe Coding & Vercel Deployment Specification
          </h1>
        </div>
        <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Complete guide answering all 4 prompts from the Backend Integration Specification and the Team 3 Addendum for the AI-Augmented Parallel ERP.
        </p>

        {/* 4 Architectural Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-mono">1. Frontend</div>
            <div className="text-xs font-bold text-slate-200 mt-0.5">React + Tailwind CSS</div>
            <div className="text-[10px] text-emerald-400 mt-1">Client SPA</div>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-mono">2. Backend</div>
            <div className="text-xs font-bold text-slate-200 mt-0.5">Node.js + Express.js</div>
            <div className="text-[10px] text-indigo-400 mt-1">Port 3000 / API Routes</div>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-mono">3. Dual LLM</div>
            <div className="text-xs font-bold text-slate-200 mt-0.5">Groq & Gemini Free Tier</div>
            <div className="text-[10px] text-amber-400 mt-1">Zero Key Leaks</div>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400 font-mono">4. Database</div>
            <div className="text-xs font-bold text-slate-200 mt-0.5">Supabase PostgreSQL</div>
            <div className="text-[10px] text-cyan-400 mt-1">RLS Protected</div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Master Environment Variables List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              Final List of Every Environment Variable Required
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              These variables must only be loaded on the Express server via <code className="text-cyan-300 font-mono">process.env</code> and never exposed in client bundles.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Variable Name</th>
                  <th className="px-4 py-3">Where to Obtain</th>
                  <th className="px-4 py-3">Purpose & Target Service</th>
                  <th className="px-4 py-3">Environments</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {envVariables.map((v) => (
                  <tr key={v.name} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-mono font-bold text-indigo-300 whitespace-nowrap">
                      {v.name}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{v.whereObtained}</td>
                    <td className="px-4 py-3 text-slate-400">{v.purpose}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                        {v.environments}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => copyToClipboard(`${v.name}="YOUR_VALUE"`, v.name)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 transition inline-flex items-center gap-1"
                      >
                        {copiedKey === v.name ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-400" />
                        )}
                        <span>{copiedKey === v.name ? 'Copied' : 'Copy'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 2: 4 Key Questions Answered */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Question 1: Where to add each variable in Vercel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-xs font-mono">
              1
            </span>
            <span>Where to add each variable in Vercel</span>
          </div>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
              <li>Log in to your <strong>Vercel Dashboard</strong> and select the project.</li>
              <li>Navigate to the top menu and click <strong>Settings</strong>.</li>
              <li>In the left sidebar, click <strong>Environment Variables</strong>.</li>
              <li>
                In the <strong>Key</strong> field, type the exact variable name (e.g.{' '}
                <code className="text-indigo-300 font-mono">GROQ_API_KEY</code>,{' '}
                <code className="text-emerald-300 font-mono">GEMINI_API_KEY</code>,{' '}
                <code className="text-cyan-300 font-mono">SUPABASE_URL</code>).
              </li>
              <li>Paste your real private key into the <strong>Value</strong> field.</li>
              <li>Click <strong>Save</strong>.</li>
            </ol>
            <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-xl text-[11px] text-indigo-300 mt-2">
              <strong>Security Audit Note:</strong> Do not prefix these variables with <code className="font-mono">NEXT_PUBLIC_</code> or <code className="font-mono">VITE_</code>. Leaving them un-prefixed ensures Vercel only provides them to server runtimes (Express), completely eliminating the possibility of key leakage into the client bundle.
            </div>
          </div>
        </div>

        {/* Question 2: Which deployment environment */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xs font-mono">
              2
            </span>
            <span>Which deployment environment should each variable be in</span>
          </div>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              In the Vercel Environment Variables modal, check <strong>all three checkboxes</strong> for every required variable:
            </p>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Production:</strong> Powers the live customer-facing domain (<code className="font-mono text-slate-400">your-project.vercel.app</code>).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Preview:</strong> Powers automated PR deployments and staging environments so pull requests can score requisitions and test summaries with real LLM calls.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Development:</strong> Injected automatically when using <code className="font-mono text-cyan-300">vercel env pull</code> on your local workstation.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Question 3: What needs to be redeployed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <span className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-xs font-mono">
              3
            </span>
            <span>What needs to be redeployed after adding variables</span>
          </div>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              Environment variables in Vercel are injected at <strong>build and container start time</strong>. Existing running deployments do NOT automatically pick up newly added variables.
            </p>
            <p className="font-semibold text-slate-200">How to trigger the required redeployment:</p>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
              <li>In the Vercel dashboard, go to the <strong>Deployments</strong> tab.</li>
              <li>Find your latest deployment at the top of the list.</li>
              <li>Click the three dots (<strong className="font-mono">•••</strong>) on the right side of the row.</li>
              <li>Select <strong>Redeploy</strong>.</li>
              <li><em>Do NOT</em> check "Use existing Build Cache" — uncheck it to guarantee that the server environment picks up fresh credentials.</li>
              <li>Alternatively, push any new commit to your <code className="font-mono text-slate-300">main</code> branch to auto-trigger a clean build.</li>
            </ol>
          </div>
        </div>

        {/* Question 4: How to verify communication */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-xs font-mono">
              4
            </span>
            <span>How to verify communication (Frontend → Backend → DB + LLMs)</span>
          </div>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>Verify each tier in sequence using these 4 checkpoints:</p>
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-indigo-300 block">Tier A: Frontend → Express Backend</span>
                <span className="text-slate-400 text-[11px]">
                  Call <code className="font-mono text-cyan-300">GET /api/health</code> in your browser. Verify it returns <code className="font-mono text-emerald-400">&#123; status: "online" &#125;</code> with latency &lt; 50ms.
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-amber-300 block">Tier B: Express Backend → Groq & Gemini APIs</span>
                <span className="text-slate-400 text-[11px]">
                  Open the <strong>Diagnostic & API Test</strong> modal in the top bar. Click "Ping Providers". Verify that Groq and Gemini return status: <code className="font-mono text-emerald-400">connected</code> and masked key preview.
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-emerald-300 block">Tier C: Express Backend → Supabase Database</span>
                <span className="text-slate-400 text-[11px]">
                  Navigate to the <strong>ERP Data Hub</strong> tab. If tables display live database records and the top badge shows "Supabase Live", the backend is securely reading and writing to Postgres.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Step-by-Step Vibe Coding Instructions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          Local Development Setup (.env & .gitignore)
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          For your local workstation, create your private <code className="text-cyan-300 font-mono">.env</code> in the repository root (already protected in <code className="text-cyan-300 font-mono">.gitignore</code>):
        </p>

        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs text-slate-300 space-y-1 relative">
          <div className="text-slate-500"># Local .env (never commit to git)</div>
          <div>GROQ_API_KEY=gsk_your_groq_key_here</div>
          <div>GEMINI_API_KEY=AIzaSy_your_gemini_key_here</div>
          <div>SUPABASE_URL=https://your-project.supabase.co</div>
          <div>SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1Ni...</div>
          <div>DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres</div>
          <div>PORT=3000</div>

          <button
            onClick={() =>
              copyToClipboard(
                `GROQ_API_KEY=gsk_your_groq_key_here\nGEMINI_API_KEY=AIzaSy_your_gemini_key_here\nSUPABASE_URL=https://your-project.supabase.co\nSUPABASE_ANON_KEY=your_key_here\nDATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres\nPORT=3000`,
                'env_block'
              )
            }
            className="absolute top-3 right-3 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition flex items-center gap-1"
          >
            {copiedKey === 'env_block' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'env_block' ? 'Copied' : 'Copy Template'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
