'use client';

import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { ScamCheckResult, ScamCategory } from '@/lib/types';
import { ResultCard } from './ResultCard';
import {
  QrCode,
  Camera,
  Upload,
  AlertTriangle,
  X,
  RefreshCw,
  Search,
  Info
} from 'lucide-react';

interface QrPayScreenProps {
  onOpenReportModal?: (target?: string, category?: ScamCategory) => void;
  onReportClick?: (target: string, category: string) => void;
  onNavigateToUpi?: () => void;
}

export const QrPayScreen: React.FC<QrPayScreenProps> = ({
  onOpenReportModal,
  onReportClick,
  onNavigateToUpi,
}) => {
  const [activeMode, setActiveMode] = useState<'qr' | 'upi'>('qr');
  const [qrInputMode, setQrInputMode] = useState<'camera' | 'upload'>('upload');

  // Camera state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // File upload state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // UPI Manual State
  const [upiInput, setUpiInput] = useState('');
  const [upiError, setUpiError] = useState<string | null>(null);

  // Common Scan Result
  const [loading, setLoading] = useState(false);
  const [decodedData, setDecodedData] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScamCheckResult | null>(null);

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Stop camera on unmount or tab switch
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setUploadError(null);
    setScanResult(null);
    setDecodedData(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported by your current browser environment.');
      setQrInputMode('upload');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);

        // Start scanning loop
        scanIntervalRef.current = setInterval(() => {
          captureAndScanFrame();
        }, 300);
      }
    } catch (err: unknown) {
      console.warn('Camera permission denied or failed:', err);
      setCameraError('Camera access was denied or is unavailable. Please use the image upload option below.');
      stopCamera();
      setQrInputMode('upload');
    }
  };

  const captureAndScanFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code && code.data) {
      stopCamera();
      handleScannedContent(code.data);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setScanResult(null);
    setDecodedData(null);

    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB limit. Please upload a smaller image.');
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Unsupported image format. Please upload JPG, PNG, or WebP.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFilePreview(result);
      decodeImageQr(result);
    };
    reader.readAsDataURL(file);
  };

  const decodeImageQr = (imageSrc: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code && code.data) {
        handleScannedContent(code.data);
      } else {
        setUploadError('No valid QR code could be detected in this image. Please ensure the code is clear and well-lit.');
      }
    };
    img.onerror = () => {
      setUploadError('Failed to load image for scanning.');
    };
    img.src = imageSrc;
  };

  const handleScannedContent = async (rawCode: string) => {
    setDecodedData(rawCode);
    setLoading(true);
    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: rawCode, category: 'upi' }),
      });
      const data = await res.json();
      setScanResult(data);
    } catch {
      setUploadError('Failed to verify scanned data.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpiCheck = async () => {
    const val = upiInput.trim();
    if (!val) {
      setUpiError('Please enter a UPI ID (e.g. name@bank).');
      return;
    }
    if (!val.includes('@') || val.split('@').length !== 2) {
      setUpiError('Invalid UPI ID format. Expected format: username@bankhandle');
      return;
    }

    setUpiError(null);
    setLoading(true);
    setScanResult(null);

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: val, category: 'upi' }),
      });
      const data = await res.json();
      setScanResult(data);
    } catch {
      setUpiError('Network error while checking UPI ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-4 pb-24 space-y-4 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">
          QR & UPI Payment Guard
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Scan QR codes or verify UPI IDs. Prevent reverse-payment & PIN collection fraud.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex bg-slate-200/80 p-1 rounded-xl">
        <button
          onClick={() => {
            setActiveMode('qr');
            setScanResult(null);
            setDecodedData(null);
          }}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeMode === 'qr' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>QR Scanner</span>
        </button>
        <button
          onClick={() => {
            stopCamera();
            if (onNavigateToUpi) {
              onNavigateToUpi();
            } else {
              setActiveMode('upi');
              setScanResult(null);
              setDecodedData(null);
            }
          }}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeMode === 'upi' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Verify UPI ID</span>
        </button>
      </div>

      {/* QR Scanner Mode */}
      {activeMode === 'qr' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
          {/* Sub-mode selector (Upload vs Camera) */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              QR Input Method
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  stopCamera();
                  setQrInputMode('upload');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  qrInputMode === 'upload' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Upload className="w-3 h-3" />
                <span>Upload Image</span>
              </button>
              <button
                onClick={() => {
                  setQrInputMode('camera');
                  startCamera();
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  qrInputMode === 'camera' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Camera className="w-3 h-3" />
                <span>Live Camera</span>
              </button>
            </div>
          </div>

          {/* Camera Viewfinder */}
          {qrInputMode === 'camera' && (
            <div className="space-y-3">
              <div className="relative w-full aspect-square max-h-72 bg-black rounded-xl overflow-hidden flex items-center justify-center border-2 border-slate-900">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Viewfinder Target Overlay */}
                <div className="absolute inset-8 border-2 border-emerald-400/80 rounded-xl pointer-events-none flex items-center justify-center">
                  <div className="w-full h-0.5 bg-emerald-400 animate-scan-line" />
                  <div className="absolute top-2 left-2 text-[10px] bg-black/60 text-emerald-300 px-1.5 py-0.5 rounded">
                    Align QR in frame
                  </div>
                </div>

                {!cameraActive && !cameraError && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-4 text-center">
                    <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mb-2" />
                    <span className="text-xs">Initializing camera stream...</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={stopCamera}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Stop Camera
                </button>
                <button
                  onClick={startCamera}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restart Camera</span>
                </button>
              </div>

              {cameraError && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{cameraError}</span>
                </div>
              )}
            </div>
          )}

          {/* Image File Upload */}
          {qrInputMode === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-8 px-4 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl bg-slate-50/70 hover:bg-emerald-50/30 flex flex-col items-center justify-center cursor-pointer transition-all text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-emerald-600 mb-2">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-slate-800">
                  Tap to upload QR screenshot
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Supports JPG, PNG, or WebP up to 5MB
                </div>
              </div>

              {filePreview && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={filePreview}
                    alt="Uploaded QR Preview"
                    className="w-12 h-12 object-cover rounded-lg border border-slate-300"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <div className="font-semibold text-slate-800 truncate">
                      {selectedFile?.name}
                    </div>
                    <div className="text-slate-400 text-[10px]">
                      {(Number(selectedFile?.size) / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setFilePreview(null);
                      setSelectedFile(null);
                      setDecodedData(null);
                      setScanResult(null);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {uploadError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{uploadError}</span>
                </div>
              )}
            </div>
          )}

          {/* Sample QR Button */}
          <div className="pt-1 flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Sample:</span>
            <button
              onClick={() => handleScannedContent('upi://pay?pa=refund-desk@okhdfcbank&pn=OLX%20Refund%20Desk&am=15000&cu=INR&tn=Scan%20to%20receive%20refund')}
              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
            >
              Test Reverse QR Scam (OLX Fake Refund)
            </button>
          </div>
        </div>
      )}

      {/* Manual UPI Check Mode */}
      {activeMode === 'upi' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
          <label htmlFor="upi-vpa-input" className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            Enter Recipient UPI ID (VPA)
          </label>

          <div className="relative">
            <input
              id="upi-vpa-input"
              type="text"
              value={upiInput}
              onChange={(e) => {
                setUpiInput(e.target.value);
                if (upiError) setUpiError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleUpiCheck();
              }}
              placeholder="e.g. merchant@okhdfcbank or user@paytm"
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Sample:</span>
            <button
              onClick={() => {
                setUpiInput('refund-desk@okhdfcbank');
                handleScannedContent('refund-desk@okhdfcbank');
              }}
              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
            >
              refund-desk@okhdfcbank
            </button>
          </div>

          {upiError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{upiError}</span>
            </div>
          )}

          <button
            onClick={handleUpiCheck}
            disabled={loading || !upiInput.trim()}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Verify UPI Identifier</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Critical UPI Rule Box */}
      <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-1.5 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          Golden Rule of UPI & QR Security
        </div>
        <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
          You <strong className="underline">NEVER</strong> need to scan a QR code or enter your UPI PIN to <strong className="underline">RECEIVE</strong> money.
          Entering your UPI PIN always <strong className="text-red-700">DEDUCTS</strong> money from your bank account.
        </p>
      </div>

      {/* Decoded QR Raw Information */}
      {decodedData && (
        <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200 space-y-1 text-xs">
          <div className="font-bold text-slate-700 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            Decoded QR Content
          </div>
          <div className="font-mono text-slate-600 break-all p-2 bg-white rounded border border-slate-200 text-[11px]">
            {decodedData}
          </div>
        </div>
      )}

      {/* Analysis Result */}
      {scanResult && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <ResultCard
            result={scanResult}
            onReport={(target, cat) => {
              if (onOpenReportModal) {
                onOpenReportModal(target, cat as ScamCategory);
              } else if (onReportClick) {
                onReportClick(target, cat);
              }
            }}
            onClear={() => {
              setScanResult(null);
              setDecodedData(null);
            }}
          />
        </div>
      )}
    </div>
  );
};
