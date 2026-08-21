import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  Eye, 
  Edit3, 
  Loader2, 
  ScanLine, 
  FileCheck, 
  FileX,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function SmartScan() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [documentType, setDocumentType] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState('upload');
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [exportFormat, setExportFormat] = useState('delta-bg');
  const fileInputRef = useRef(null);

  const steps = [
    { id: 'upload', label: 'Качване', icon: Upload },
    { id: 'classify', label: 'Класификация', icon: ScanLine },
    { id: 'extract', label: 'Извличане', icon: FileText },
    { id: 'validate', label: 'Валидация', icon: CheckCircle },
    { id: 'review', label: 'Преглед', icon: Eye },
    { id: 'export', label: 'Експорт', icon: Download }
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setCurrentStep('upload');
      setDocumentType(null);
      setExtractedData(null);
      setValidationResults(null);
    }
  };

  const classifyDocument = async () => {
    if (!selectedFile) return;

    setProcessing(true);
    setCurrentStep('classify');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result.split(',')[1];
        
        const response = await fetch('/api/document-scanner/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Image,
            imageType: selectedFile.type
          })
        });

        const result = await response.json();
        
        if (result.success) {
          setDocumentType(result.documentType);
          setCurrentStep('extract');
        } else {
          throw new Error(result.error || 'Failed to classify document');
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Classification error:', error);
      alert('Грешка при класификация: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const extractData = async () => {
    if (!selectedFile || !documentType) return;

    setProcessing(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result.split(',')[1];
        
        const endpoint = documentType === 'invoice' 
          ? '/api/document-scanner/extract-invoice'
          : '/api/document-scanner/extract-document';

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Image,
            imageType: selectedFile.type,
            documentType
          })
        });

        const result = await response.json();
        
        if (result.success) {
          setExtractedData(result.data);
          setEditedData(JSON.parse(JSON.stringify(result.data)));
          
          if (documentType === 'invoice') {
            await validateInvoice(result.data);
          } else {
            setCurrentStep('review');
          }
        } else {
          throw new Error(result.error || 'Failed to extract data');
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Extraction error:', error);
      alert('Грешка при извличане: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const validateInvoice = async (data) => {
    try {
      setCurrentStep('validate');
      const response = await fetch('/api/document-scanner/validate-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceData: data })
      });

      const result = await response.json();
      if (result.success) {
        setValidationResults(result.validation);
        setCurrentStep('review');
      }
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  const saveEditedData = () => {
    setExtractedData(editedData);
    setEditMode(false);
    if (documentType === 'invoice') {
      validateInvoice(editedData);
    }
  };

  const exportDocument = async () => {
    if (!extractedData) return;

    setProcessing(true);
    setCurrentStep('export');

    try {
      const documents = [{
        type: documentType,
        data: extractedData,
        image: imagePreview
      }];

      const endpoint = exportFormat === 'delta-bg'
        ? '/api/document-scanner/export-delta-bg'
        : '/api/document-scanner/export-trz';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents })
      });

      const result = await response.json();
      
      if (result.success) {
        const blob = new Blob([result.fileContent], {
          type: exportFormat === 'delta-bg' ? 'text/csv' : 'application/xml'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Грешка при експорт: ' + error.message);
    } finally {
      setProcessing(false);
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
                <ScanLine className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span>AI Document SmartScan & OCR</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Интелигентно OCR сканиране, автоматична екстракция и валидация на фактури и счетоводни документи.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Качи Документ</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Progress Steps Bento */}
      <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-xl overflow-x-auto">
        <div className="flex items-center justify-between min-w-[600px]">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isPassed = steps.findIndex(s => s.id === currentStep) > index;
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 border border-cyan-400' 
                      : isPassed 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-white/5 text-slate-500 border border-white/10'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-mono font-bold mt-2 ${
                    isActive ? 'text-cyan-300' : isPassed ? 'text-emerald-400' : 'text-slate-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 rounded-full transition-all ${
                    isPassed ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-white/10'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Preview Bento */}
        {imagePreview ? (
          <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Преглед на Документа</span>
            </h3>

            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 p-2">
              <img 
                src={imagePreview} 
                alt="Document preview" 
                className="w-full max-h-[350px] object-contain rounded-xl"
              />
            </div>

            {documentType && (
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">Тип на документа:</span>
                <span className="font-bold text-cyan-300 uppercase">{documentType}</span>
              </div>
            )}

            {!documentType && selectedFile && (
              <button
                onClick={classifyDocument}
                disabled={processing}
                className="w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Класифициране...</span>
                  </>
                ) : (
                  <>
                    <ScanLine className="w-4 h-4" />
                    <span>Класифицирай Документ</span>
                  </>
                )}
              </button>
            )}

            {documentType && !extractedData && !processing && (
              <button
                onClick={extractData}
                className="w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Извлечи OCR Данни</span>
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-3xl p-12 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Camera className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-base font-bold text-white">Няма избран документ</h3>
            <p className="text-xs text-slate-400 max-w-sm">Качете фактура или документ за стартиране на Smart Scan екстракцията.</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
            >
              Избери Файл
            </button>
          </div>
        )}

        {/* Extracted Data Bento */}
        {extractedData && (
          <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Извлечени Данни</span>
              </h3>
              <button
                onClick={() => setEditMode(!editMode)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono border border-white/10 flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{editMode ? 'Отказ' : 'Редактирай'}</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
              {documentType === 'invoice' && (
                <InvoiceDataDisplay 
                  data={editMode ? editedData : extractedData}
                  editMode={editMode}
                  onUpdate={setEditedData}
                />
              )}
            </div>

            {editMode && (
              <button
                onClick={saveEditedData}
                className="w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 transition-all shadow-lg shadow-emerald-500/25 cursor-pointer"
              >
                Запази Промените
              </button>
            )}

            {validationResults && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                {validationResults.isValid ? (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs font-mono text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Всички счетоводни валидации са преминати успешно!</span>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs font-mono text-rose-300">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Открити са несъответствия във валидацията</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Export Bento */}
      {extractedData && (
        <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-white/[0.06] to-white/[0.01] backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Счетоводен Експорт & Интеграция</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Формат на експорта</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#090f1d]/90 text-white font-medium text-sm border border-white/10 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/15 outline-none"
              >
                <option value="delta-bg" className="bg-[#0c1426]">Microsoft Delta BG (CSV)</option>
                <option value="trz" className="bg-[#0c1426]">Microsoft TRZ (XML)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={exportDocument}
                disabled={processing}
                className="w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Експортиране...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Експортирай & Свали</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InvoiceDataDisplay({ data, editMode, onUpdate }) {
  const handleFieldChange = (field, value) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <DataField 
          label="Номер на фактура" 
          value={data.invoiceNumber}
          editMode={editMode}
          onChange={(v) => handleFieldChange('invoiceNumber', v)}
        />
        <DataField 
          label="Дата" 
          value={data.invoiceDate}
          editMode={editMode}
          type="date"
          onChange={(v) => handleFieldChange('invoiceDate', v)}
        />
        <DataField 
          label="Доставчик" 
          value={data.vendorName}
          editMode={editMode}
          onChange={(v) => handleFieldChange('vendorName', v)}
        />
        <DataField 
          label="ЕИК / ДДС Номер" 
          value={data.vendorTaxId}
          editMode={editMode}
          onChange={(v) => handleFieldChange('vendorTaxId', v)}
        />
        <DataField 
          label="Обща Сума" 
          value={data.totalAmount}
          editMode={editMode}
          type="number"
          onChange={(v) => handleFieldChange('totalAmount', parseFloat(v) || 0)}
          className="font-bold text-cyan-400"
        />
        <DataField 
          label="Валута" 
          value={data.currency || 'BGN'}
          editMode={editMode}
          onChange={(v) => handleFieldChange('currency', v)}
        />
      </div>
    </div>
  );
}

function DataField({ label, value, editMode, onChange, type = 'text', className = '' }) {
  return (
    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">{label}</label>
      {editMode ? (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-1.5 rounded-xl bg-[#090f1d]/90 text-white font-medium text-xs border border-white/10 focus:border-cyan-400 outline-none"
        />
      ) : (
        <p className={`text-xs font-mono font-bold text-white ${className}`}>
          {value || <span className="text-slate-600">N/A</span>}
        </p>
      )}
    </div>
  );
}
