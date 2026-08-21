import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
const TELEGRAM_API = `${API_BASE}/api/telegram`;

function TelegramExtractor() {
  const [inputIds, setInputIds] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [botStatus, setBotStatus] = useState(null);
  const [groupBy, setGroupBy] = useState('none');
  const [exportFormat, setExportFormat] = useState('json');

  const checkBotStatus = useCallback(async () => {
    try {
      const res = await fetch(`${TELEGRAM_API}/status`);
      const data = await res.json();
      setBotStatus(data);
    } catch (err) {
      setBotStatus({ success: false, error: err.message });
    }
  }, []);

  React.useEffect(() => { checkBotStatus(); }, [checkBotStatus]);

  const extractUsernames = async () => {
    const ids = inputIds
      .split(/[\n,;]+/)
      .map(id => id.trim())
      .filter(id => id && /^\d+$/.test(id));

    if (ids.length === 0) {
      setError('Въведете поне един валиден Telegram user ID (само цифри)');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const batchResults = [];
      const batchSize = 5;

      for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize);
        const promises = batch.map(async (userId) => {
          try {
            const res = await fetch(`${TELEGRAM_API}/resolve-user`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId }),
            });
            const data = await res.json();
            return {
              userId,
              username: data.username || null,
              firstName: data.firstName || null,
              lastName: data.lastName || null,
              isBot: data.isBot || false,
              status: data.success ? 'resolved' : 'failed',
              error: data.error || null,
            };
          } catch {
            return { userId, status: 'error', error: 'Request failed' };
          }
        });
        const batchData = await Promise.all(promises);
        batchResults.push(...batchData);
        setResults([...batchResults]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const groupedResults = React.useMemo(() => {
    if (groupBy === 'none') return { 'All': results };
    if (groupBy === 'status') {
      return results.reduce((acc, r) => {
        const key = r.status;
        (acc[key] = acc[key] || []).push(r);
        return acc;
      }, {});
    }
    if (groupBy === 'hasUsername') {
      return results.reduce((acc, r) => {
        const key = r.username ? 'Has Username' : 'No Username';
        (acc[key] = acc[key] || []).push(r);
        return acc;
      }, {});
    }
    return { 'All': results };
  }, [results, groupBy]);

  const exportResults = () => {
    let content, filename, type;
    if (exportFormat === 'json') {
      content = JSON.stringify(results, null, 2);
      filename = 'telegram_users.json';
      type = 'application/json';
    } else {
      const header = 'user_id,username,first_name,last_name,is_bot,status\n';
      const rows = results.map(r =>
        `${r.userId},${r.username || ''},${r.firstName || ''},${r.lastName || ''},${r.isBot},${r.status}`
      ).join('\n');
      content = header + rows;
      filename = 'telegram_users.csv';
      type = 'text/csv';
    }
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resolved = results.filter(r => r.status === 'resolved').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Telegram Extractor</h1>
          <p className="text-gray-400 mt-1">
            Извличане на usernames от Telegram user IDs
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            botStatus?.configured ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            Bot: {botStatus?.configured ? botStatus.bot?.username || 'Connected' : 'Not Configured'}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
            Задача 19
          </span>
        </div>
      </div>

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6"
      >
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Telegram User IDs (по един на ред или разделени със запетая)
        </label>
        <textarea
          value={inputIds}
          onChange={(e) => setInputIds(e.target.value)}
          placeholder="123456789&#10;987654321&#10;555666777"
          rows={6}
          className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm resize-y"
        />

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">
            {inputIds.split(/[\n,;]+/).filter(id => id.trim() && /^\d+$/.test(id.trim())).length} валидни ID-та
          </span>
          <button
            onClick={extractUsernames}
            disabled={loading}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Извличане... ({results.length})</span>
              </>
            ) : (
              <span>Извлечи Usernames</span>
            )}
          </button>
        </div>
      </motion.div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Stats & Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-white">
                Резултати ({resolved}/{results.length} resolved)
              </h2>
              <div className="flex items-center space-x-2">
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  className="px-3 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-sm text-gray-300"
                >
                  <option value="none">Без групиране</option>
                  <option value="status">По статус</option>
                  <option value="hasUsername">По username</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="px-3 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-sm text-gray-300"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
              <button
                onClick={exportResults}
                className="px-4 py-1.5 bg-dark-700 hover:bg-dark-600 text-gray-300 text-sm rounded-lg transition-colors"
              >
                Export
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-green-500 transition-all duration-300"
              style={{ width: `${(resolved / results.length) * 100}%` }}
            />
          </div>

          {/* Grouped Tables */}
          {Object.entries(groupedResults).map(([group, items]) => (
            <div key={group} className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden">
              {group !== 'All' && (
                <div className="px-5 py-3 border-b border-dark-700 bg-dark-800/80">
                  <h3 className="text-sm font-medium text-gray-300">{group} ({items.length})</h3>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-700">
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bot</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-700/50">
                    {items.map((r, idx) => (
                      <tr key={idx} className="hover:bg-dark-700/30">
                        <td className="px-5 py-3 text-sm font-mono text-gray-300">{r.userId}</td>
                        <td className="px-5 py-3 text-sm">
                          {r.username ? (
                            <span className="text-primary-400">@{r.username}</span>
                          ) : (
                            <span className="text-gray-600">-</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-300">
                          {[r.firstName, r.lastName].filter(Boolean).join(' ') || '-'}
                        </td>
                        <td className="px-5 py-3 text-sm">
                          {r.isBot ? (
                            <span className="text-yellow-400">Bot</span>
                          ) : (
                            <span className="text-gray-600">-</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            r.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                            r.status === 'failed' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Info */}
      <div className="bg-dark-800/30 border border-dark-700/50 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Как работи</h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start space-x-2">
            <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5"></span>
            <span>Въведете Telegram user IDs (числови) - получени от чатове, групи или forwarded съобщения</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5"></span>
            <span>Системата опитва да resolve-не username, име и тип акаунт чрез Telegram Bot API</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5"></span>
            <span>Резултатите могат да се групират и експортират като JSON или CSV</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0 mt-1.5"></span>
            <span>Ограничение: Telegram Bot API може да resolve-не само потребители, които са взаимодействали с бота</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default TelegramExtractor;
