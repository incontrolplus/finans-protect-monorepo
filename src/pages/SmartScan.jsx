import { useState, useRef } from 'react';
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
  FileX
} from 'lucide-react';

export default function SmartScan() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [documentType, setDocumentType] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState('upload'); // upload, classify, extract, validate, review, export
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [exportFormat, setExportFormat] = useState('delta-bg');
  const fileInputRef = useRef(null);

  const steps = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'classify', label: 'Classify', icon: ScanLine },
    { id: 'extract', label: 'Extract', icon: FileText },
    { id: 'validate', label: 'Validate', icon: CheckCircle },
    { id: 'review', label: 'Review', icon: Eye },
    { id: 'export', label: 'Export', icon: Download }
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      
      // Create preview
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
          throw new Error(result.error);
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Classification error:', error);
      alert('Failed to classify document: ' + error.message);
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
          
          // Automatically validate if it's an invoice
          if (documentType === 'invoice') {
            await validateInvoice(result.data);
          } else {
            setCurrentStep('review');
          }
        } else {
          throw new Error(result.error);
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Extraction error:', error);
      alert('Failed to extract data: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const validateInvoice = async (data = extractedData) => {
    setProcessing(true);
    setCurrentStep('validate');

    try {
      const response = await fetch('/api/document-scanner/validate-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      });

      const result = await response.json();
      
      if (result.success) {
        setValidationResults(result);
        setCurrentStep('review');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Validation error:', error);
      alert('Failed to validate data: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const saveEditedData = () => {
    setExtractedData(editedData);
    setEditMode(false);
    
    // Re-validate if invoice
    if (documentType === 'invoice') {
      validateInvoice(editedData);
    }
  };

  const exportDocument = async () => {
    setProcessing(true);
    setCurrentStep('export');

    try {
      const documents = [{
        documentType,
        data: extractedData,
        validationStatus: validationResults?.isValid ? 'validated' : 'pending'
      }];

      const endpoint = exportFormat === 'delta-bg'
        ? '/api/document-scanner/export/delta-bg'
        : '/api/document-scanner/export/trz';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents })
      });

      const result = await response.json();
      
      if (result.success) {
        // Validate the export
        const validationResponse = await fetch('/api/document-scanner/validate-export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileContent: result.fileContent,
            format: exportFormat
          })
        });

        const validationResult = await validationResponse.json();
        
        if (validationResult.success && validationResult.validation.isValid) {
          // Download file
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

          alert('File exported successfully and validated!');
        } else {
          alert('Export validation failed: ' + validationResult.validation.errors.join(', '));
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export document: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Smart Scan</h1>
          <p className="text-sm sm:text-base text-gray-400 mt-1 sm:mt-2">
            AI-powered document scanning and data extraction
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fileInputRef.current?.click()}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-lg font-medium hover:from-sky-600 hover:to-sky-700 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
          Upload Document
        </motion.button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Progress Steps */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 md:p-6 border border-gray-700/50 overflow-x-auto">
        <div className="flex items-center justify-between min-w-max sm:min-w-0">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isPassed = steps.findIndex(s => s.id === currentStep) > index;
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${
                    isActive 
                      ? 'bg-sky-500 text-white' 
                      : isPassed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </div>
                  <span className={`text-xs sm:text-sm mt-1 sm:mt-2 whitespace-nowrap ${
                    isActive ? 'text-sky-400' : isPassed ? 'text-green-400' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 sm:h-1 mx-1 sm:mx-2 md:mx-4 transition-all ${
                    isPassed ? 'bg-green-500' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Image Preview */}
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-700/50"
          >
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 md:mb-4">Document Preview</h3>
            <img 
              src={imagePreview} 
              alt="Document preview" 
              className="w-full rounded-lg border border-gray-700"
            />
            
            {documentType && (
              <div className="mt-4 p-4 bg-sky-500/10 border border-sky-500/30 rounded-lg">
                <p className="text-sky-400 font-medium">
                  Document Type: <span className="capitalize">{documentType}</span>
                </p>
              </div>
            )}

            {!documentType && selectedFile && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={classifyDocument}
                disabled={processing}
                className="w-full mt-4 px-6 py-3 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Classifying...
                  </>
                ) : (
                  <>
                    <ScanLine className="w-5 h-5" />
                    Classify Document
                  </>
                )}
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Extracted Data */}
        {extractedData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-white">Extracted Data</h3>
              <button
                onClick={() => setEditMode(!editMode)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                {editMode ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="space-y-3 md:space-y-4 max-h-64 sm:max-h-80 md:max-h-96 overflow-y-auto">
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
                className="w-full mt-4 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all"
              >
                Save Changes
              </button>
            )}

            {validationResults && (
              <div className="mt-4 space-y-2">
                {validationResults.validationErrors?.length > 0 && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-center gap-2 text-red-400 font-medium mb-2">
                      <FileX className="w-5 h-5" />
                      Validation Errors
                    </div>
                    {validationResults.validationErrors.map((error, idx) => (
                      <p key={idx} className="text-sm text-red-300">
                        • {error.message}
                      </p>
                    ))}
                  </div>
                )}

                {validationResults.warnings?.length > 0 && (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-400 font-medium mb-2">
                      <AlertCircle className="w-5 h-5" />
                      Warnings
                    </div>
                    {validationResults.warnings.map((warning, idx) => (
                      <p key={idx} className="text-sm text-yellow-300">
                        • {warning.message}
                      </p>
                    ))}
                  </div>
                )}

                {validationResults.isValid && validationResults.warnings?.length === 0 && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-2 text-green-400 font-medium">
                      <FileCheck className="w-5 h-5" />
                      All validations passed!
                    </div>
                  </div>
                )}
              </div>
            )}

            {documentType && !extractedData && !processing && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={extractData}
                className="w-full mt-4 px-6 py-3 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 transition-all"
              >
                Extract Data
              </motion.button>
            )}
          </motion.div>
        )}
      </div>

      {/* Export Section */}
      {extractedData && validationResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-700/50"
        >
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 md:mb-4">Export Document</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs sm:text-sm text-gray-400 mb-2">Export Format</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none text-sm sm:text-base"
              >
                <option value="delta-bg">Microsoft Delta BG (CSV)</option>
                <option value="trz">Microsoft TRZ (XML)</option>
              </select>
            </div>

            <div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={exportDocument}
                disabled={processing}
                className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Export & Download
                  </>
                )}
              </motion.button>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 text-sm">
              <strong>Note:</strong> The exported file will be validated automatically before download. 
              It will be ready for USB transfer and import into Microsoft accounting software.
            </p>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!selectedFile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20"
        >
          <Camera className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-gray-600 mb-3 md:mb-4" />
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-400 mb-2 text-center px-4">No Document Selected</h3>
          <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 text-center px-4">Upload a document to get started with Smart Scan</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 transition-all text-sm sm:text-base"
          >
            Choose File
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

// Invoice data display component
function InvoiceDataDisplay({ data, editMode, onUpdate }) {
  const handleFieldChange = (field, value) => {
    onUpdate({ ...data, [field]: value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...data.items];
    newItems[index] = { ...newItems[index], [field]: value };
    onUpdate({ ...data, items: newItems });
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Basic Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <DataField 
          label="Invoice Number" 
          value={data.invoiceNumber}
          editMode={editMode}
          onChange={(v) => handleFieldChange('invoiceNumber', v)}
        />
        <DataField 
          label="Invoice Date" 
          value={data.invoiceDate}
          editMode={editMode}
          type="date"
          onChange={(v) => handleFieldChange('invoiceDate', v)}
        />
        <DataField 
          label="Due Date" 
          value={data.dueDate}
          editMode={editMode}
          type="date"
          onChange={(v) => handleFieldChange('dueDate', v)}
        />
        <DataField 
          label="Currency" 
          value={data.currency}
          editMode={editMode}
          onChange={(v) => handleFieldChange('currency', v)}
        />
      </div>

      {/* Vendor Info */}
      <div className="border-t border-gray-700 pt-3 md:pt-4">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-400 mb-2">Vendor Information</h4>
        <div className="space-y-2">
          <DataField 
            label="Vendor Name" 
            value={data.vendorName}
            editMode={editMode}
            onChange={(v) => handleFieldChange('vendorName', v)}
          />
          <DataField 
            label="Vendor Address" 
            value={data.vendorAddress}
            editMode={editMode}
            onChange={(v) => handleFieldChange('vendorAddress', v)}
          />
          <DataField 
            label="Tax ID" 
            value={data.vendorTaxId}
            editMode={editMode}
            onChange={(v) => handleFieldChange('vendorTaxId', v)}
          />
        </div>
      </div>

      {/* Items */}
      {data.items && data.items.length > 0 && (
        <div className="border-t border-gray-700 pt-3 md:pt-4">
          <h4 className="text-xs sm:text-sm font-semibold text-gray-400 mb-2">Items</h4>
          <div className="space-y-2 md:space-y-3">
            {data.items.map((item, idx) => (
              <div key={idx} className="p-2 md:p-3 bg-gray-700/30 rounded-lg space-y-2">
                <DataField 
                  label="Description" 
                  value={item.description}
                  editMode={editMode}
                  onChange={(v) => handleItemChange(idx, 'description', v)}
                />
                <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                  <DataField 
                    label="Qty" 
                    value={item.quantity}
                    editMode={editMode}
                    type="number"
                    onChange={(v) => handleItemChange(idx, 'quantity', parseFloat(v) || 0)}
                  />
                  <DataField 
                    label="Unit Price" 
                    value={item.unitPrice}
                    editMode={editMode}
                    type="number"
                    onChange={(v) => handleItemChange(idx, 'unitPrice', parseFloat(v) || 0)}
                  />
                  <DataField 
                    label="Total" 
                    value={item.totalPrice}
                    editMode={editMode}
                    type="number"
                    onChange={(v) => handleItemChange(idx, 'totalPrice', parseFloat(v) || 0)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Totals */}
      <div className="border-t border-gray-700 pt-3 md:pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <DataField 
            label="Subtotal" 
            value={data.subtotal}
            editMode={editMode}
            type="number"
            onChange={(v) => handleFieldChange('subtotal', parseFloat(v) || 0)}
          />
          <DataField 
            label="Tax Amount" 
            value={data.taxAmount}
            editMode={editMode}
            type="number"
            onChange={(v) => handleFieldChange('taxAmount', parseFloat(v) || 0)}
          />
          <DataField 
            label="Tax Rate (%)" 
            value={data.taxRate}
            editMode={editMode}
            type="number"
            onChange={(v) => handleFieldChange('taxRate', parseFloat(v) || 0)}
          />
          <DataField 
            label="Total Amount" 
            value={data.totalAmount}
            editMode={editMode}
            type="number"
            onChange={(v) => handleFieldChange('totalAmount', parseFloat(v) || 0)}
            className="font-bold text-sky-400"
          />
        </div>
      </div>
    </div>
  );
}

// Reusable data field component
function DataField({ label, value, editMode, onChange, type = 'text', className = '' }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      {editMode ? (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none text-xs sm:text-sm"
        />
      ) : (
        <p className={`text-xs sm:text-sm text-white ${className}`}>
          {value || <span className="text-gray-600">N/A</span>}
        </p>
      )}
    </div>
  );
}
