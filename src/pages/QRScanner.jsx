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
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles className="w-10 h-10 text-primary-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              AI Image Scanner & QR Generator
            </h1>
          </div>
          <p className="text-dark-400">
            Upload an image for automatic analysis and QR code generation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Area */}
            {!capturedImage && (
              <div className="card">
                <div
                  className={`border-3 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
                    dragActive
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-dark-600 hover:border-primary-400 hover:bg-dark-700/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-16 h-16 text-dark-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Upload Image
                  </h3>
                  <p className="text-dark-500 mb-4">
                    Click or drag & drop file here
                  </p>
                  <p className="text-sm text-dark-500">
                    Supported formats: JPG, PNG, WebP (max 10MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="card">
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-500" />
                  <p className="text-dark-300 font-medium">Analyzing image...</p>
                </div>
              </div>
            )}

            {/* Results */}
            {capturedImage && !loading && (
              <div className="space-y-6">
                {/* Image Preview */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Image</h2>
                    <button
                      onClick={reset}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      New Scan
                    </button>
                  </div>
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full rounded-lg"
                  />
                </div>

                {/* Extracted Data */}
                {extractedData && (
                  <div className="card">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold">Extracted Data</h2>
                      <button
                        onClick={copyToClipboard}
                        className="btn-secondary flex items-center gap-2"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-dark-400">Title</label>
                        <p className="text-lg font-semibold mt-1">{extractedData.title}</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-dark-400">Category</label>
                        <span className="inline-block mt-1 px-3 py-1 glass-effect text-primary-400 rounded-full text-sm">
                          {extractedData.category}
                        </span>
                      </div>

                      {extractedData.mainElements && extractedData.mainElements.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-dark-400">Key Elements</label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {extractedData.mainElements.map((element, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 glass-effect rounded-full text-sm"
                              >
                                {element}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {extractedData.text && (
                        <div>
                          <label className="text-sm font-medium text-dark-400">Extracted Text</label>
                          <p className="mt-1 p-3 glass-effect rounded-lg">
                            {extractedData.text}
                          </p>
                        </div>
                      )}

                      {extractedData.tags && extractedData.tags.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-dark-400">Tags</label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {extractedData.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 glass-effect text-green-400 rounded-full text-sm"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* QR Code */}
                {qrCodeUrl && (
                  <div className="card">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold">QR Code</h2>
                      <button
                        onClick={downloadQR}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                    <div className="flex justify-center p-6 glass-effect rounded-lg">
                      <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                    </div>
                    <p className="text-center text-sm text-dark-500 mt-4">
                      Scan this code to view the data
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Saved Records */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary-400" />
                Saved ({savedRecords.length})
              </h2>

              {savedRecords.length === 0 ? (
                <div className="text-center py-8">
                  <QrCode className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                  <p className="text-dark-500 text-sm">
                    No saved records yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {savedRecords.map((record) => (
                    <div
                      key={record.id}
                      className="glass-effect rounded-lg p-3 hover:bg-white/10 transition-colors"
                    >
                      <img
                        src={record.image}
                        alt={record.data.title}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                      <h3 className="font-medium text-sm mb-1 truncate">
                        {record.data.title}
                      </h3>
                      <p className="text-xs text-dark-500 mb-3">
                        {new Date(record.timestamp).toLocaleString()}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewRecord(record)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 glass-effect hover:bg-primary-500/20 rounded-lg text-xs transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                        <button
                          onClick={() => deleteRecord(record.id)}
                          className="px-3 py-1.5 glass-effect hover:bg-red-500/20 text-red-400 rounded-lg text-xs transition-colors"
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
    </div>
  );
};

export default QRScanner;
