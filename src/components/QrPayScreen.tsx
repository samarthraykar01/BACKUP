'use client';

import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { ScamCheckResult } from '@/lib/types';
import { ResultCard } from './ResultCard';

interface QrPayScreenProps {
  onReportClick: (target: string, category: string) => void;
}

export const QrPayScreen: React.FC<QrPayScreenProps> = ({ onReportClick }) => {
  const [activeMode, setActiveMode] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualUpi, setManualUpi] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [decodedData, setDecodedData] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScamCheckResult | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Stop camera when unmounting or switching modes
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    setDecodedData(null);
    setScanResult(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your current browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        scanFrame();
      }
    } catch (err: any) {
      console.warn('Camera start error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in browser settings or use image upload.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. Please use the image upload option.');
      } else {
        setCameraError('Unable to open camera stream. Please try the upload option.');
      }
      setCameraActive(false);
    }
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        // QR Code detected!
        stopCamera();
        handleProcessQrData(code.data);
        return;
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCameraError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setCameraError('Image file is too large (max 10MB).');
      return;
    }

    setCameraError(null);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsLoading(false);
          setCameraError('Canvas rendering failed.');
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: 'attemptBoth',
        });

        setIsLoading(false);

        if (code && code.data) {
          handleProcessQrData(code.data);
        } else {
          setCameraError('No QR code could be read from this image. Ensure the QR code is clear, well-lit, and not cropped.');
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleProcessQrData = async (rawString: string) => {
    setDecodedData(rawString);
    setIsLoading(true);

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: rawString,
          category: 'upi',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to inspect QR payload.');
      }
      setScanResult(data);
    } catch (err: any) {
      setCameraError(err.message || 'Inspection error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUpi.trim()) return;
    handleProcessQrData(manualUpi.trim());
  };

  return (
    <div className="flex flex-col w-full px-4 pt-3 pb-24 space-y-4 max-w-lg mx-auto">
      {/* Title */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-[#53e076] text-[22px]">
            qr_code_scanner
          </span>
          QR & Pay Guard
        </h1>
        <p className="text-xs text-[#a1a1aa] leading-relaxed">
          Inspect UPI payment QR codes and Virtual Payment Addresses (VPA) before scanning in banking apps.
        </p>
      </div>

      {/* Critical PIN Education Banner */}
      <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-start gap-2.5 text-xs text-[#ffb4ab]">
        <span className="material-symbols-outlined text-[20px] text-[#ef4444] shrink-0 mt-0.5 fill-icon">
          report
        </span>
        <div className="flex flex-col">
          <span className="font-bold text-white text-[11px] uppercase tracking-wide">
            Golden Rule of UPI Safety
          </span>
          <span className="text-[11px] leading-relaxed mt-0.5 text-zinc-300">
            You <strong className="text-white underline">NEVER</strong> need to enter your UPI PIN to receive money, refunds, or OLX payments. Entering your UPI PIN always debits money from your bank account!
          </span>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex p-1 bg-[#1c1b1b] rounded-xl border border-white/[0.06] gap-1">
        <button
          onClick={() => {
            stopCamera();
            setActiveMode('camera');
            setCameraError(null);
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeMode === 'camera'
              ? 'bg-[#131313] text-[#53e076] border border-[#1db954]/30 shadow-sm'
              : 'text-[#a1a1aa] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">
            photo_camera
          </span>
          <span>Camera</span>
        </button>

        <button
          onClick={() => {
            stopCamera();
            setActiveMode('upload');
            setCameraError(null);
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeMode === 'upload'
              ? 'bg-[#131313] text-[#53e076] border border-[#1db954]/30 shadow-sm'
              : 'text-[#a1a1aa] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">
            upload_file
          </span>
          <span>Image</span>
        </button>

        <button
          onClick={() => {
            stopCamera();
            setActiveMode('manual');
            setCameraError(null);
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            activeMode === 'manual'
              ? 'bg-[#131313] text-[#53e076] border border-[#1db954]/30 shadow-sm'
              : 'text-[#a1a1aa] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">edit</span>
          <span>UPI ID</span>
        </button>
      </div>

      {/* Camera Mode */}
      {activeMode === 'camera' && (
        <div className="bg-[#1c1b1b] rounded-2xl border border-white/[0.08] p-4 shadow-[0_4px_24px_rgba(0,0,0,0.5)] space-y-3 flex flex-col items-center">
          <div className="relative w-full aspect-square max-h-[300px] bg-black rounded-xl overflow-hidden flex items-center justify-center border border-white/[0.08]">
            <video
              ref={videoRef}
              className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Viewfinder Target Overlays */}
            {cameraActive ? (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-[#1db954] rounded-2xl relative animate-pulse">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-[#53e076]" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-[#53e076]" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-[#53e076]" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-[#53e076]" />
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#1db954]/60 shadow-[0_0_8px_#1db954]" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-white/[0.06] flex items-center justify-center text-[#a1a1aa]">
                  <span className="material-symbols-outlined text-[28px]">
                    videocam_off
                  </span>
                </div>
                <span className="text-sm font-semibold text-white">
                  Camera Inactive
                </span>
                <span className="text-xs text-[#a1a1aa] max-w-[220px]">
                  Tap below to start scanner. Camera stream stops automatically once scanned.
                </span>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="w-full p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-xs text-[#ffb4ab] flex items-start gap-2">
              <span className="material-symbols-outlined text-[17px] shrink-0 mt-0.5">
                error
              </span>
              <span>{cameraError}</span>
            </div>
          )}

          <div className="w-full flex gap-2">
            {!cameraActive ? (
              <button
                onClick={startCamera}
                className="w-full py-3 bg-[#1db954] hover:bg-[#1aa34a] text-black font-semibold rounded-xl text-sm shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[19px]">
                  photo_camera
                </span>
                <span>Open Scanner</span>
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="w-full py-2.5 bg-white/[0.08] hover:bg-white/[0.12] text-white font-medium rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[17px]">
                  stop_circle
                </span>
                <span>Stop Camera</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Upload Mode */}
      {activeMode === 'upload' && (
        <div className="bg-[#1c1b1b] rounded-2xl border border-white/[0.08] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.5)] space-y-3">
          <label className="border-2 border-dashed border-white/[0.12] hover:border-[#1db954]/50 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-[#131313]/60 group">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-[#1db954]/15 border border-[#1db954]/30 flex items-center justify-center text-[#53e076] group-hover:scale-105 transition-transform mb-3">
              <span className="material-symbols-outlined text-[24px]">
                file_upload
              </span>
            </div>
            <span className="text-sm font-semibold text-white">
              Upload QR Screenshot / Photo
            </span>
            <span className="text-xs text-[#a1a1aa] mt-1">
              Supports PNG, JPG, WebP up to 10MB
            </span>
            <span className="mt-3 px-3 py-1 rounded-full bg-white/[0.06] text-[11px] text-[#53e076] font-medium border border-white/[0.05]">
              Browse Gallery
            </span>
          </label>

          {isLoading && (
            <div className="flex items-center justify-center gap-2 p-3 text-xs text-[#53e076]">
              <span className="w-4 h-4 border-2 border-[#1db954] border-t-transparent rounded-full animate-spin" />
              <span>Decoding QR matrix and inspecting payload...</span>
            </div>
          )}

          {cameraError && (
            <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-xs text-[#ffb4ab] flex items-start gap-2">
              <span className="material-symbols-outlined text-[17px] shrink-0 mt-0.5">
                error
              </span>
              <span>{cameraError}</span>
            </div>
          )}
        </div>
      )}

      {/* Manual UPI ID Mode */}
      {activeMode === 'manual' && (
        <div className="bg-[#1c1b1b] rounded-2xl border border-white/[0.08] p-4 shadow-[0_4px_24px_rgba(0,0,0,0.5)] space-y-3">
          <form onSubmit={handleManualCheck} className="space-y-3">
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-white flex items-center justify-between">
                <span>UPI ID / Virtual Payment Address</span>
                <span className="text-[10px] text-[#71717a]">e.g. name@bank</span>
              </label>

              <div className="flex items-center gap-2 px-3 py-2.5 bg-[#131313] rounded-xl border border-white/[0.06] focus-within:border-[#1db954] transition-all">
                <span className="material-symbols-outlined text-[20px] text-[#53e076] shrink-0">
                  alternate_email
                </span>
                <input
                  type="text"
                  value={manualUpi}
                  onChange={(e) => setManualUpi(e.target.value)}
                  placeholder="payee@okaxis or refund-desk@ybl"
                  className="w-full bg-transparent text-sm text-white placeholder:text-[#71717a] focus:outline-none"
                />
                {manualUpi && (
                  <button
                    type="button"
                    onClick={() => setManualUpi('')}
                    className="p-1 text-[#a1a1aa] hover:text-white"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !manualUpi.trim()}
              className="w-full py-3 bg-[#1db954] hover:bg-[#1aa34a] disabled:opacity-50 disabled:pointer-events-none text-black font-semibold rounded-xl text-sm shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Checking VPA Reputation...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">
                    verified_user
                  </span>
                  <span>Inspect UPI ID</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Examples */}
          <div className="pt-2 border-t border-white/[0.05] space-y-1.5">
            <span className="text-[10px] text-[#71717a] uppercase tracking-wider font-semibold">
              Test Common UPI Profiles
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Fake Refund Desk', val: 'refund-desk@okhdfcbank' },
                { label: 'OLX Advance Buyer', val: 'buyer-verification@ybl' },
                { label: 'Legitimate Merchant', val: 'store@okaxis' },
              ].map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setManualUpi(s.val)}
                  className="px-2.5 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-[11px] text-[#a1a1aa] hover:text-white border border-white/[0.04] transition-all active:scale-95"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Raw Decoded Data Display */}
      {decodedData && (
        <div className="p-3 bg-[#131313] rounded-xl border border-white/[0.06] space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#a1a1aa]">
            <span className="font-semibold uppercase tracking-wider">
              Decoded Raw Payload
            </span>
            <span className="text-[#53e076]">Parsed Successfully</span>
          </div>
          <div className="text-xs font-mono text-white/90 break-all select-all">
            {decodedData}
          </div>
        </div>
      )}

      {/* Analysis Result */}
      {scanResult && (
        <ResultCard
          result={scanResult}
          onClose={() => setScanResult(null)}
          onReportClick={(target, category) => onReportClick(target, category)}
        />
      )}
    </div>
  );
};
