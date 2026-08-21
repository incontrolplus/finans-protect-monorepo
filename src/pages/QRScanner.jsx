import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, QrCode, Check, Copy, Sparkles, Download, Trash2, Eye, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

const QRScanner = () => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedRecords, setSavedRecords] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    loadSavedRecords();
  }, []);

  const loadSavedRecords = () => {
    try {
      const stored = localStorage.getItem('qr-scanner-records');
      if (stored) {
        const records = JSON.parse(stored);
        setSavedRecords(records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      }
    } catch (err) {
      console.error('Error loading records:', err);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum size: 10MB');
      return;
    }

    setError('');
    const reader = new FileReader();

    reader.onload = (event) => {
      setCapturedImage(event.target.result);
      analyzeImage(event.target.result);
    };

    reader.onerror = () => {
      setError('Error reading file. Please try again.');
    };

    reader.readAsDataURL(file);
  };

  const analyzeImage = async (imageData) => {
    setLoading(true);
    setError('');
    setExtractedData(null);
    setQrCodeUrl('');

    try {
      // Use backend API endpoint instead of direct Anthropic call
      const response = await axios.post('/api/claude/analyze-image', {
        image: imageData,
        prompt: `Analyze this image and extract key information in JSON format. Return ONLY valid JSON with this structure:
{
  "title": "brief descriptive title",
  "category": "category type (document/product/person/scene/other)",
  "mainElements": ["key element 1", "key element 2", "key element 3"],
  "text": "any visible text extracted",
  "colors": ["primary color", "secondary color"],
  "context": "brief description of what this shows",
  "tags": ["tag1", "tag2", "tag3"]
}

Be concise and accurate. Extract actual text if visible. If no text, describe what you see.`
      });

      if (response.data.success) {
        const extracted = response.data.extractedData;
        setExtractedData(extracted);
        await generateQRCode(extracted);
        await saveRecord(imageData, extracted);
      } else {
        throw new Error(response.data.error || 'Analysis failed');
      }

    } catch (err) {
      console.error('Analysis error:', err);
      setError(`Analysis error: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (data) => {
    try {
      const qrData = JSON.stringify(data, null, 2);
      const encodedData = encodeURIComponent(qrData);
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedData}&margin=10`;
      setQrCodeUrl(qrUrl);
    } catch (err) {
      console.error('QR generation error:', err);
      setError('Error generating QR code');
    }
  };

  const saveRecord = async (image, data) => {
    try {
      const timestamp = new Date().toISOString();
      const id = `scan-record-${Date.now()}`;

      const record = {
        id,
        image,
        data,
        timestamp
      };

      const stored = localStorage.getItem('qr-scanner-records');
      const records = stored ? JSON.parse(stored) : [];
      records.unshift(record);

      // Keep only last 50 records
      const trimmed = records.slice(0, 50);
      localStorage.setItem('qr-scanner-records', JSON.stringify(trimmed));

      loadSavedRecords();
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const deleteRecord = (id) => {
    try {
      const stored = localStorage.getItem('qr-scanner-records');
      if (stored) {
        const records = JSON.parse(stored);
        const filtered = records.filter(r => r.id !== id);
        localStorage.setItem('qr-scanner-records', JSON.stringify(filtered));
        loadSavedRecords();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const viewRecord = (record) => {
    setCapturedImage(record.image);
    setExtractedData(record.data);
    generateQRCode(record.data);
  };

  const copyToClipboard = async () => {
    if (!extractedData) return;

    try {
      await navigator.clipboard.writeText(JSON.stringify(extractedData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy error:', err);
    }
  };

  const downloadQR = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qr-code-${Date.now()}.png`;
    link.click();
  };

  const reset = () => {
    setCapturedImage(null);
    setExtractedData(null);
    setQrCodeUrl('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fadeIn">
      {/* Liquid Glass Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-[#0c1426]/90 via-[#0e1b38]/80 to-[#080d1a]/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] shadow-lg shadow-cyan-500/20 shrink-0">
              <div className="w-full h-full bg-[#080d1a] rounded-[15px] flex items-center justify-center">
                <QrCode className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span>AI Vision Scanner & QR Studio</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Анализ на изображения с Claude Vision AI и автоматично генериране на криптирани QR кодове.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Качи Изображение</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Workspace (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Dropzone */}
          {!capturedImage && (
            <div
              className={`relative rounded-3xl p-10 sm:p-12 text-center transition-all cursor-pointer bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border-2 border-dashed ${
                dragActive
                  ? 'border-cyan-400 bg-cyan-500/10 shadow-2xl ring-4 ring-cyan-500/20'
                  : 'border-white/15 hover:border-cyan-400/50 hover:bg-white/[0.04]'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                Качете или плъзнете файл тук
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Автоматично разпознаване на текст, обекти и контекст
              </p>
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-white/5 text-slate-400 border border-white/10">
                JPG, PNG, WebP (макс. 10MB)
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="rounded-3xl p-12 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col items-center justify-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/10 border-t-cyan-400" />
              <p className="text-xs font-mono font-bold text-cyan-300">Claude AI Vision анализира изображението...</p>
            </div>
          )}

          {/* Results Workspace */}
          {capturedImage && !loading && (
            <div className="space-y-6">
              {/* Image Preview Bento */}
              <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4 overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">Сканирано Изображение</h2>
                  <button
                    onClick={reset}
                    className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono border border-white/10 flex items-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Нов Скан</span>
                  </button>
                </div>
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 p-2">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full max-h-[350px] object-contain rounded-xl"
                  />
                </div>
              </div>

              {/* Extracted Data Bento */}
              {extractedData && (
                <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4 overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">AI Анализ & Екстракция</h2>
                    <button
                      onClick={copyToClipboard}
                      className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono border border-white/10 flex items-center gap-1.5 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Копирано!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Копирай</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                      <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Заглавие</label>
                      <p className="text-sm font-bold text-white">{extractedData.title}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-slate-400">Категория</span>
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        {extractedData.category}
                      </span>
                    </div>

                    {extractedData.text && (
                      <div className="p-4 rounded-2xl bg-[#080d1a]/95 border border-white/10">
                        <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Разпознат Текст (OCR)</label>
                        <p className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{extractedData.text}</p>
                      </div>
                    )}

                    {extractedData.tags && extractedData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {extractedData.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* QR Code Bento */}
              {qrCodeUrl && (
                <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4 overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">Генериран QR Код</h2>
                    <button
                      onClick={downloadQR}
                      className="px-4 py-2 rounded-2xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Свали QR</span>
                    </button>
                  </div>
                  <div className="flex justify-center p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                    <img src={qrCodeUrl} alt="QR Code" className="w-56 h-56 rounded-xl shadow-lg border border-white/10" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Saved Scans (1 col) */}
        <div className="lg:col-span-1">
          <div className="relative rounded-3xl p-6 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4 sticky top-6">
            <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span>Запазени Сканове ({savedRecords.length})</span>
            </h2>

            {savedRecords.length === 0 ? (
              <div className="text-center py-8">
                <QrCode className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-mono">Няма запазени сканове</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                {savedRecords.map((record) => (
                  <div
                    key={record.id}
                    className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-400/30 transition-all space-y-2"
                  >
                    <img
                      src={record.image}
                      alt={record.data?.title}
                      className="w-full h-24 object-cover rounded-xl border border-white/10"
                    />
                    <h3 className="font-bold text-xs text-white truncate">
                      {record.data?.title || 'Скан'}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400">
                      {new Date(record.timestamp).toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewRecord(record)}
                        className="flex-1 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 text-xs font-mono border border-white/10 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        Преглед
                      </button>
                      <button
                        onClick={() => deleteRecord(record.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
