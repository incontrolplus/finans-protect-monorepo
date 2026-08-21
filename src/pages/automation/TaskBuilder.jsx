import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Workflow, Plus, Trash2, Play, ChevronDown, AlertCircle } from 'lucide-react';

const API = '/api/playwright';

const STEP_TYPES = [
  { id: 'navigate', label: 'Navigate', fields: [{ name: 'url', label: 'URL', type: 'url' }] },
  { id: 'click', label: 'Click', fields: [{ name: 'description', label: 'Element Description', type: 'text' }, { name: 'selector', label: 'CSS Selector (alt)', type: 'text' }] },
  { id: 'type', label: 'Type', fields: [{ name: 'selector', label: 'Selector', type: 'text' }, { name: 'text', label: 'Text', type: 'text' }] },
  { id: 'wait', label: 'Wait', fields: [{ name: 'type', label: 'Type (time/element/network)', type: 'text' }, { name: 'value', label: 'Value', type: 'text' }] },
  { id: 'screenshot', label: 'Screenshot', fields: [] },
  { id: 'extract', label: 'Extract', fields: [{ name: 'query', label: 'Query', type: 'text' }] },
  { id: 'fillForm', label: 'Fill Form', fields: [{ name: 'dataJson', label: 'Data (JSON)', type: 'textarea' }] },
  { id: 'evaluate', label: 'Evaluate JS', fields: [{ name: 'script', label: 'Script', type: 'textarea' }] },
];

function StepCard({ step, index, onChange, onDelete }) {
  const stepDef = STEP_TYPES.find(s => s.id === step.type);

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-sky-500/20 rounded-full flex items-center justify-center text-xs text-sky-400 font-bold">{index + 1}</span>
          <select
            value={step.type}
            onChange={e => onChange(index, { ...step, type: e.target.value, params: {} })}
            className="bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-sm text-white"
          >
            {STEP_TYPES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <button onClick={() => onDelete(index)} className="text-red-400 hover:text-red-300">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {stepDef?.fields.map(field => (
        <div key={field.name}>
          <label className="text-xs text-gray-400 mb-1 block">{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea
              value={step.params?.[field.name] || ''}
              onChange={e => onChange(index, { ...step, params: { ...step.params, [field.name]: e.target.value } })}
              rows={3}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-sky-500/50 resize-none"
            />
          ) : (
            <input
              type={field.type}
              value={step.params?.[field.name] || ''}
              onChange={e => onChange(index, { ...step, params: { ...step.params, [field.name]: e.target.value } })}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500/50"
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function TaskBuilder() {
  const [steps, setSteps] = useState([{ type: 'navigate', params: { url: 'https://example.com' } }]);
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const addStep = () => {
    setSteps(s => [...s, { type: 'navigate', params: {} }]);
  };

  const updateStep = (index, step) => {
    setSteps(s => s.map((item, i) => i === index ? step : item));
  };

  const deleteStep = (index) => {
    setSteps(s => s.filter((_, i) => i !== index));
  };

  const runTask = async () => {
    setRunning(true);
    setError(null);
    setResults([]);

    try {
      // Create session
      const sessionRes = await fetch(`${API}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const sessionData = await sessionRes.json();
      if (!sessionData.success) throw new Error('Failed to create session');
      const sid = sessionData.data.sessionId;
      setSessionId(sid);

      const stepResults = [];

      // Execute each step
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        try {
          let res;
          const headers = { 'Content-Type': 'application/json' };

          if (step.type === 'navigate') {
            res = await fetch(`${API}/sessions/${sid}/navigate`, { method: 'POST', headers, body: JSON.stringify({ url: step.params.url }) });
          } else if (step.type === 'click') {
            res = await fetch(`${API}/sessions/${sid}/click`, { method: 'POST', headers, body: JSON.stringify(step.params) });
          } else if (step.type === 'type') {
            res = await fetch(`${API}/sessions/${sid}/type`, { method: 'POST', headers, body: JSON.stringify(step.params) });
          } else if (step.type === 'wait') {
            res = await fetch(`${API}/sessions/${sid}/wait`, { method: 'POST', headers, body: JSON.stringify(step.params) });
          } else if (step.type === 'screenshot') {
            res = await fetch(`${API}/sessions/${sid}/screenshot`);
          } else if (step.type === 'extract') {
            res = await fetch(`${API}/sessions/${sid}/extract`, { method: 'POST', headers, body: JSON.stringify(step.params) });
          } else if (step.type === 'fillForm') {
            let data = {};
            try { data = JSON.parse(step.params.dataJson || '{}'); } catch (_) {
              stepResults.push({ step: i + 1, type: step.type, success: false, error: 'Invalid JSON in fillForm data' });
              continue;
            }
            res = await fetch(`${API}/sessions/${sid}/fillForm`, { method: 'POST', headers, body: JSON.stringify({ data }) });
          } else if (step.type === 'evaluate') {
            res = await fetch(`${API}/sessions/${sid}/evaluate`, { method: 'POST', headers, body: JSON.stringify({ script: step.params.script }) });
          }

          const data = res ? await res.json() : null;
          stepResults.push({ step: i + 1, type: step.type, success: data?.success ?? false, data: data?.data });
        } catch (err) {
          stepResults.push({ step: i + 1, type: step.type, success: false, error: err.message });
        }
      }

      setResults(stepResults);

      // Close session
      await fetch(`${API}/sessions/${sid}`, { method: 'DELETE' });
      setSessionId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Workflow className="w-6 h-6 text-sky-400" />
            Task Builder
          </h1>
          <p className="text-gray-400 text-sm mt-1">Build multi-step automation workflows</p>
        </div>
        <div className="flex gap-2">
          <button onClick={addStep} className="flex items-center gap-2 px-3 py-2 bg-white/5 text-gray-400 hover:text-white rounded-lg text-sm">
            <Plus className="w-4 h-4" />
            Add Step
          </button>
          <button
            onClick={runTask}
            disabled={running || steps.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            {running ? 'Running...' : 'Run Task'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, i) => (
          <StepCard key={i} step={step} index={i} onChange={updateStep} onDelete={deleteStep} />
        ))}
        <button
          onClick={addStep}
          className="w-full border-2 border-dashed border-white/10 rounded-xl p-4 text-gray-500 hover:text-gray-300 hover:border-white/20 transition-all text-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Step
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-2">
          <h2 className="text-sm font-semibold text-gray-300">Execution Results</h2>
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-black/20 rounded-lg">
                <span className={`mt-0.5 ${r.success ? 'text-green-400' : 'text-red-400'}`}>
                  {r.success ? '✓' : '✗'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">Step {r.step}: {r.type}</p>
                  {r.error && <p className="text-xs text-red-400 mt-0.5">{r.error}</p>}
                  {r.data && (
                    <pre className="text-xs text-gray-400 mt-1 overflow-auto max-h-20">
                      {JSON.stringify(r.data, null, 2).slice(0, 200)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
