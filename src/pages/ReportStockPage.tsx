import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Camera, Upload, CheckCircle2, AlertCircle, RefreshCw, Send, Edit2, Code, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { PHC, StockReportItem } from '../types';
import { storeService } from '../services/storeService';
import { analyzeShelfPhoto, VisionAnalysisResult } from '../services/geminiVision';

export const ReportStockPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialPhcId = searchParams.get('phcId') || 'phc-tambaram';

  const [phcs, setPhcs] = useState<PHC[]>([]);
  const [selectedPhcId, setSelectedPhcId] = useState<string>(initialPhcId);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<VisionAnalysisResult | null>(null);
  const [editableItems, setEditableItems] = useState<StockReportItem[]>([]);
  
  const [showJsonRaw, setShowJsonRaw] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  useEffect(() => {
    const data = storeService.getPHCs();
    setPhcs(data);
  }, []);

  // Preset sample shelf photos for quick 1-click testing during live demo!
  const handleSelectSampleImage = async (sampleType: 'shelf1' | 'shelf2') => {
    // Generate SVG/DataURL sample shelf images
    const label = sampleType === 'shelf1' ? 'Dengue & Fever Shelf Photo' : 'Antibiotics & Fluids Shelf Photo';
    
    // Create dummy SVG canvas to simulate shelf photo File
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
      <rect width="600" height="400" fill="#252A33"/>
      <rect x="20" y="50" width="560" height="20" fill="#4A5568"/>
      <rect x="20" y="200" width="560" height="20" fill="#4A5568"/>
      <rect x="20" y="350" width="560" height="20" fill="#4A5568"/>
      <!-- Shelf items -->
      <rect x="40" y="80" width="100" height="110" fill="#B7410E" rx="8"/>
      <text x="90" y="140" fill="#FFF" font-family="sans-serif" font-size="14" text-anchor="middle" font-weight="bold">Paracetamol</text>
      <text x="90" y="160" fill="#FAF7F5" font-family="sans-serif" font-size="12" text-anchor="middle">500mg Boxes</text>

      <rect x="160" y="90" width="120" height="100" fill="#15803D" rx="8"/>
      <text x="220" y="145" fill="#FFF" font-family="sans-serif" font-size="14" text-anchor="middle" font-weight="bold">ORS Kits</text>
      
      <rect x="300" y="70" width="80" height="120" fill="#B45309" rx="8"/>
      <text x="340" y="130" fill="#FFF" font-family="sans-serif" font-size="12" text-anchor="middle" font-weight="bold">NS 500ml</text>

      <rect x="400" y="100" width="140" height="90" fill="#4A5568" rx="8"/>
      <text x="470" y="150" fill="#FFF" font-family="sans-serif" font-size="13" text-anchor="middle" font-weight="bold">Platelet Kits</text>

      <text x="300" y="380" fill="#FAF7F5" font-family="sans-serif" font-size="14" text-anchor="middle">${label}</text>
    </svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const file = new File([blob], `${sampleType}_medicine_shelf.svg`, { type: 'image/svg+xml' });
    
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(blob));
    setAnalysisResult(null);
    setIsSubmitted(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
      setIsSubmitted(false);
    }
  };

  const handleAnalyzePhoto = async () => {
    if (!imageFile) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    const result = await analyzeShelfPhoto(imageFile);
    setIsAnalyzing(false);
    setAnalysisResult(result);
    setEditableItems(result.items.map(item => ({ ...item })));
  };

  const handleItemChange = (index: number, field: keyof StockReportItem, value: any) => {
    const updated = [...editableItems];
    updated[index] = { ...updated[index], [field]: value };
    setEditableItems(updated);
  };

  const handleAddItem = () => {
    setEditableItems([
      ...editableItems,
      { medicineName: 'New Medicine Item', quantity: 50, confidence: 'high', category: 'Analgesics', unit: 'strips' }
    ]);
  };

  const handleConfirmAndSave = () => {
    if (!selectedPhcId || editableItems.length === 0) return;

    const targetPhc = phcs.find(p => p.id === selectedPhcId);
    const phcName = targetPhc ? targetPhc.name : selectedPhcId;

    // Update PHC stock in store
    storeService.updatePHCStock(selectedPhcId, editableItems, 'photo');

    // Save report entry
    storeService.saveReport({
      phcId: selectedPhcId,
      phcName,
      photoUrl: imagePreviewUrl || '',
      rawModelResponse: analysisResult?.rawResponse || '',
      parsedItems: editableItems,
    });

    setIsSubmitted(true);
  };

  const selectedPhc = phcs.find(p => p.id === selectedPhcId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal flex items-center gap-2">
            <Camera size={26} className="text-rust" />
            <span>Photo-to-Stock Intake</span>
          </h1>
          <p className="text-slate-secondary text-sm">
            Mechanism 1: AI Vision model extracts stock counts from shelf photos directly into the network.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-rust/10 border border-rust/30 px-3 py-1.5 rounded-full text-rust text-xs font-bold">
          <Sparkles size={14} />
          <span>Gemini 1.5 Multimodal Engine</span>
        </div>
      </div>

      {/* Main WhatsApp-Styled Chat Upload Container */}
      <div className="bg-white rounded-2xl border border-slate-border shadow-md overflow-hidden flex flex-col">
        {/* WhatsApp-Style Top Header Bar */}
        <div className="bg-charcoal text-white px-6 py-4 flex items-center justify-between border-b border-charcoal-surface">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rust flex items-center justify-center font-bold text-lg text-white">
              AI
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">EchoStock Vision Assistant</h3>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Online • Ready for Shelf Upload</span>
              </p>
            </div>
          </div>

          {/* PHC Selector Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-300 font-medium hidden sm:inline">Reporting for:</label>
            <select
              value={selectedPhcId}
              onChange={(e) => setSelectedPhcId(e.target.value)}
              className="bg-charcoal-card text-white text-xs font-semibold rounded-lg px-3 py-1.5 border border-slate-600 focus:outline-none focus:border-rust"
            >
              {phcs.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.district})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Upload Body Area */}
        <div className="p-6 space-y-6 bg-offwhite/50">
          {!isSubmitted ? (
            <>
              {/* Step 1: Photo Input / Sample Picker */}
              <div className="bg-white p-6 rounded-xl border border-slate-border space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-bold text-sm text-charcoal flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rust text-white text-xs flex items-center justify-center">1</span>
                    Upload or Select Medicine Shelf Photo
                  </h4>

                  {/* Sample presets for 1-click testing */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-subtle font-medium">Try Sample Shelf:</span>
                    <button
                      onClick={() => handleSelectSampleImage('shelf1')}
                      className="px-2.5 py-1 bg-rust-light text-rust hover:bg-rust/20 rounded font-semibold transition-colors"
                    >
                      Shelf Photo #1
                    </button>
                    <button
                      onClick={() => handleSelectSampleImage('shelf2')}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded font-semibold transition-colors"
                    >
                      Shelf Photo #2
                    </button>
                  </div>
                </div>

                {/* Dropzone / Preview */}
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-rust transition-colors bg-white">
                  {imagePreviewUrl ? (
                    <div className="space-y-4">
                      <img
                        src={imagePreviewUrl}
                        alt="Medicine Shelf Preview"
                        className="max-h-64 mx-auto rounded-lg shadow-sm border border-slate-200 object-contain"
                      />
                      <div className="flex items-center justify-center gap-3">
                        <label className="cursor-pointer text-xs font-semibold text-rust hover:underline flex items-center gap-1">
                          <Upload size={14} />
                          <span>Change Photo</span>
                          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer block space-y-3">
                      <div className="w-12 h-12 rounded-full bg-rust-light text-rust mx-auto flex items-center justify-center">
                        <Camera size={24} />
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-charcoal block">Take Photo or Browse Image</span>
                        <span className="text-xs text-slate-subtle">PNG, JPG, SVG up to 10MB</span>
                      </div>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  )}
                </div>

                {/* Trigger Analyze Button */}
                {imageFile && !analysisResult && (
                  <button
                    onClick={handleAnalyzePhoto}
                    disabled={isAnalyzing}
                    className="w-full bg-rust hover:bg-rust-hover text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        <span>Gemini Vision Model Reading Shelf Stock...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        <span>Run AI Shelf Stock Extraction</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Step 2: AI Result & Editable Confirmation Table */}
              {analysisResult && (
                <div className="bg-white p-6 rounded-xl border border-slate-border space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-border pb-4">
                    <div>
                      <h4 className="font-bold text-base text-charcoal flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-emerald-600" />
                        <span>Confirm Extracted Stock Counts</span>
                      </h4>
                      <p className="text-xs text-slate-secondary">
                        Confirm or edit counts read by Gemini Vision model before writing to network.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowJsonRaw(!showJsonRaw)}
                      className="text-xs text-slate-secondary hover:text-charcoal font-semibold flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded"
                    >
                      <Code size={13} />
                      <span>{showJsonRaw ? 'Hide JSON' : 'View Model JSON'}</span>
                    </button>
                  </div>

                  {/* Optional Collapsible Model Raw Output */}
                  {showJsonRaw && (
                    <div className="bg-charcoal text-emerald-400 p-4 rounded-lg text-xs font-mono overflow-x-auto space-y-1">
                      <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Raw Gemini API Multimodal Output</div>
                      <pre>{analysisResult.rawResponse}</pre>
                    </div>
                  )}

                  {/* Editable Items Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-offwhite text-slate-secondary text-xs font-semibold uppercase tracking-wider border-b border-slate-border">
                          <th className="py-2.5 px-3">Medicine Packaging Label</th>
                          <th className="py-2.5 px-3 w-32">Extracted Count</th>
                          <th className="py-2.5 px-3">AI Confidence</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-border">
                        {editableItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-3 px-3">
                              <input
                                type="text"
                                value={item.medicineName}
                                onChange={(e) => handleItemChange(idx, 'medicineName', e.target.value)}
                                className="w-full font-semibold text-charcoal bg-transparent border-b border-slate-200 focus:border-rust focus:outline-none text-sm"
                              />
                            </td>

                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  value={item.quantity}
                                  onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 0)}
                                  className="w-20 font-bold text-charcoal bg-offwhite border border-slate-border rounded px-2 py-1 text-sm focus:outline-none focus:border-rust"
                                />
                                <span className="text-xs text-slate-subtle">{item.unit || 'units'}</span>
                              </div>
                            </td>

                            <td className="py-3 px-3">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                item.confidence === 'high'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {item.confidence.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={handleAddItem}
                      className="text-xs font-semibold text-rust hover:underline flex items-center gap-1"
                    >
                      + Add Unlisted Medicine
                    </button>

                    <button
                      onClick={handleConfirmAndSave}
                      className="bg-rust hover:bg-rust-hover text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all flex items-center gap-2 text-sm"
                    >
                      <Send size={16} />
                      <span>Confirm & Update Network Stock</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Success State */
            <div className="bg-white p-8 rounded-xl border border-emerald-200 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>

              <div>
                <h3 className="font-serif text-2xl font-bold text-charcoal">
                  Stock Report Updated Live!
                </h3>
                <p className="text-slate-secondary text-sm mt-1">
                  Updated {editableItems.length} essential medicines for <strong className="text-charcoal">{selectedPhc?.name}</strong>.
                </p>
              </div>

              <div className="pt-4 flex flex-wrap justify-center gap-4">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 bg-rust hover:bg-rust-hover text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow transition-colors"
                >
                  <span>View Updated Live Dashboard</span>
                  <ArrowRight size={16} />
                </Link>

                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setAnalysisResult(null);
                    setImageFile(null);
                    setImagePreviewUrl(null);
                  }}
                  className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-charcoal px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors"
                >
                  <RefreshCw size={16} />
                  <span>Submit Another Photo</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
