import React, { useState, useEffect } from 'react';
import {
  STUDIO_BACKDROPS,
  StudioBackdrop,
  renderStudioComposite,
} from '../../lib/studioEngine';
import { uploadImageToServer } from '../../lib/db';
import {
  Sparkles,
  Check,
  RotateCcw,
  Sliders,
  Upload,
  Wand2,
  Eye,
} from 'lucide-react';

interface AtelierPhotoStudioProps {
  sourceImageUrl: string;
  aspectRatio?: '3:4' | '16:9';
  slotLabel?: string;
  onApplyImage: (retouchedDataUrl: string, appliedBackdrop?: StudioBackdrop) => void;
}

export const AtelierPhotoStudio: React.FC<AtelierPhotoStudioProps> = ({
  sourceImageUrl,
  aspectRatio = '3:4',
  slotLabel = 'Garment Image',
  onApplyImage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [originalBackupUrl, setOriginalBackupUrl] = useState<string>(sourceImageUrl);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [activeGroup, setActiveGroup] = useState<StudioBackdrop['group']>('studio');
  const [selectedBackdropId, setSelectedBackdropId] = useState<string>('ivory-cyclorama');
  const [customBackdropUrl, setCustomBackdropUrl] = useState<string>('');
  const [removalMode, setRemovalMode] = useState<
    'neural-ai' | 'auto' | 'tight' | 'gentle' | 'keep-bg'
  >('neural-ai');
  const [contactShadow, setContactShadow] = useState<boolean>(true);
  const [subjectScale, setSubjectScale] = useState<number>(1.0);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Update backup when a brand-new external image is loaded while closed
  useEffect(() => {
    if (!isOpen && sourceImageUrl) {
      setOriginalBackupUrl(sourceImageUrl);
    }
  }, [sourceImageUrl, isOpen]);

  // Automatically render standardized composite preview when studio controls change
  useEffect(() => {
    if (!isOpen || !originalBackupUrl) return;

    let cancelled = false;
    setIsRendering(true);

    const timer = setTimeout(async () => {
      try {
        const result = await renderStudioComposite({
          sourceImageUrl: originalBackupUrl,
          backdropId: selectedBackdropId,
          customBackdropUrl: customBackdropUrl || undefined,
          removalMode,
          enhanceLighting: false,
          sharpenGarment: false,
          contactShadow,
          subjectScale,
          aspectRatio,
        });
        if (!cancelled) {
          setPreviewUrl(result);
          setStatusMessage(
            '100% Untouched Garment & Model Pixels · Standardized Studio Placement Ready'
          );
        }
      } catch (err) {
        console.warn('Studio composite preview warning:', err);
        if (!cancelled) {
          setPreviewUrl(originalBackupUrl);
          setStatusMessage(
            'Showing original image (remote CORS lock — upload from device for full studio cutout)'
          );
        }
      } finally {
        if (!cancelled) {
          setIsRendering(false);
        }
      }
    }, 80);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    isOpen,
    originalBackupUrl,
    selectedBackdropId,
    customBackdropUrl,
    removalMode,
    contactShadow,
    subjectScale,
    aspectRatio,
  ]);

  if (!sourceImageUrl) return null;

  const filteredBackdrops = STUDIO_BACKDROPS.filter((b) => b.group === activeGroup);
  const currentBackdrop =
    STUDIO_BACKDROPS.find((b) => b.id === selectedBackdropId) || STUDIO_BACKDROPS[0];

  const handleApplyRetouched = () => {
    if (!previewUrl) return;
    onApplyImage(previewUrl, currentBackdrop);
    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 3500);
  };

  const handleRevertOriginal = () => {
    if (!originalBackupUrl) return;
    onApplyImage(originalBackupUrl, undefined);
    setPreviewUrl(originalBackupUrl);
    setStatusMessage('Reverted to untouched original upload');
  };

  return (
    <div className="mt-3">
      {/* Studio Toggle Trigger Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (!isOpen) {
              setOriginalBackupUrl(sourceImageUrl);
            }
            setIsOpen(!isOpen);
          }}
          className={`px-3.5 py-2 text-xs font-mono uppercase tracking-wider flex items-center gap-2 border transition-colors whitespace-nowrap shrink-0 ${
            isOpen
              ? 'bg-amber-400 text-black border-amber-400 font-semibold'
              : 'bg-neutral-900 text-amber-300 border-amber-400/50 hover:border-amber-400'
          }`}
        >
          <Wand2 size={13} />
          <span>
            {isOpen
              ? 'Close Standardized Studio Compositor'
              : `Open Standardized Studio Backdrop Compositor · ${slotLabel}`}
          </span>
        </button>

        {appliedSuccess && (
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
            <Check size={13} />
            <span>Studio Redesign Applied &amp; Bio Context Synced</span>
          </span>
        )}
      </div>

      {/* Expanded Inline Studio Workspace */}
      {isOpen && (
        <div className="mt-3 border border-neutral-800 bg-neutral-950 p-5 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-4 border-b border-neutral-900">
            <div>
              <h4 className="font-serif text-xl text-white font-light tracking-wide">
                Standardized Atelier Background Removal &amp; Studio Placement
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Zero Garment Distortion · 100% Untouched Model &amp; Cloth Pixels · Automatic Center &amp; Floor Alignment
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <span>Standard Frame: {aspectRatio}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400">Subject Integrity Locked</span>
            </div>
          </div>

          {/* 1. Category Tabs for the 20 Standardized Backdrops */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-widest text-neutral-300 font-mono">
                1. Choose Standardized Studio Backdrop (20 Curated Sets)
              </span>

              {/* Custom Backdrop Photo Upload */}
              <label className="cursor-pointer border border-neutral-700 hover:border-white px-3 py-1 text-[11px] uppercase tracking-wider font-mono text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0">
                <Upload size={12} />
                <span>
                  {customBackdropUrl ? 'Change Custom Backdrop' : 'Upload Custom Backdrop Photo'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const dataUrl = await uploadImageToServer(file);
                      setCustomBackdropUrl(dataUrl);
                    }
                  }}
                />
              </label>
            </div>

            {/* 4 Environment Group Tabs */}
            <div className="flex flex-wrap gap-1.5 border-b border-neutral-900 pb-3">
              {[
                { id: 'studio', label: 'Studio Cyclorama (1–5)' },
                { id: 'editorial', label: 'Editorial Dark (6–10)' },
                { id: 'architectural', label: 'Architectural Stone (11–15)' },
                { id: 'warm', label: 'Warm Bespoke Salon (16–20)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setCustomBackdropUrl('');
                    setActiveGroup(tab.id as StudioBackdrop['group']);
                  }}
                  className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 ${
                    activeGroup === tab.id && !customBackdropUrl
                      ? 'bg-white text-black font-semibold'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 5 Swatches per Tab */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {filteredBackdrops.map((bd) => {
                const isSelected = selectedBackdropId === bd.id && !customBackdropUrl;
                return (
                  <button
                    key={bd.id}
                    type="button"
                    onClick={() => {
                      setCustomBackdropUrl('');
                      setSelectedBackdropId(bd.id);
                    }}
                    className={`p-3 text-left border transition-all flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'border-amber-400 bg-neutral-900'
                        : 'border-neutral-800 bg-black hover:border-neutral-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-6 h-6 shrink-0 border border-white/20"
                        style={{
                          background: `linear-gradient(180deg, ${bd.wallTop} 0%, ${bd.wallMid} 65%, ${bd.floorTop} 100%)`,
                        }}
                      />
                      <span className="text-xs font-medium text-white leading-tight">
                        {bd.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-400 line-clamp-1">
                      {bd.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Standardized Cutout & Framing Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-neutral-900">
            {/* Cutout Method */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-neutral-300 font-mono flex items-center gap-1.5">
                <Sliders size={12} />
                <span>2. Standardized Cutout Mode (Clothes &amp; Person Untouched)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'neural-ai', label: 'AI Precision Cutout' },
                  { id: 'gentle', label: 'Perimeter Matte' },
                  { id: 'keep-bg', label: 'Keep Original BG' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setRemovalMode(m.id as any)}
                    className={`px-3 py-2 text-xs font-mono uppercase border transition-colors whitespace-nowrap ${
                      removalMode === m.id
                        ? 'border-white bg-white text-black font-semibold'
                        : 'border-neutral-800 bg-black text-neutral-400 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Standardized Placement & Grounding */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-neutral-300 font-mono block">
                3. Standardized Framing &amp; Floor Grounding
              </label>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
                <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400">
                  <span>Framing:</span>
                  {[
                    { sc: 0.92, label: 'Full Look (92%)' },
                    { sc: 1.0, label: 'Standard (100%)' },
                    { sc: 1.06, label: 'Close-Up (106%)' },
                  ].map((item) => (
                    <button
                      key={item.sc}
                      type="button"
                      onClick={() => setSubjectScale(item.sc)}
                      className={`px-2.5 py-1.5 border text-[11px] transition-colors ${
                        subjectScale === item.sc
                          ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-semibold'
                          : 'border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300 font-mono">
                  <input
                    type="checkbox"
                    checked={contactShadow}
                    onChange={(e) => setContactShadow(e.target.checked)}
                    className="w-4 h-4 accent-amber-400"
                  />
                  <span>Studio Floor Ground Shadow</span>
                </label>
              </div>
            </div>
          </div>

          {/* 3. Side-by-Side Standardized Job View (Before vs After) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Before: Untouched Original */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                <span>Original Upload (Before)</span>
                <span>Untouched Source</span>
              </div>
              <div
                className={`w-full bg-neutral-900/40 border border-neutral-800 overflow-hidden flex items-center justify-center ${
                  aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[3/4] max-h-[420px]'
                }`}
              >
                <img
                  src={originalBackupUrl}
                  alt="Original upload"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* After: Standardized Studio Backdrop Composite */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-amber-300 flex items-center gap-1.5">
                  <Eye size={13} />
                  <span>Standardized Studio Job View (After)</span>
                </span>
                <span className="text-neutral-400">
                  {customBackdropUrl ? 'Custom Backdrop' : currentBackdrop.name}
                </span>
              </div>
              <div
                className={`relative w-full bg-neutral-900/40 border border-amber-400/40 overflow-hidden flex items-center justify-center ${
                  aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[3/4] max-h-[420px]'
                }`}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Studio retouched preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain transition-opacity duration-200"
                    style={{ opacity: isRendering ? 0.55 : 1 }}
                  />
                ) : (
                  <div className="text-xs font-mono text-neutral-500">
                    Preparing Standardized Studio View...
                  </div>
                )}

                {isRendering && (
                  <div className="absolute inset-0 bg-black/55 flex items-center justify-center p-4 text-center">
                    <span className="px-4 py-2.5 bg-black border border-neutral-700 text-xs font-mono text-amber-300">
                      Isolating Subject &amp; Placing on {currentBackdrop.name}...
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. Action Bar: Apply Retouched Photo vs Keep Original */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-neutral-900">
            <span className="text-xs font-mono text-neutral-400">
              {statusMessage || 'Select any studio backdrop above for standardized preview'}
            </span>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleRevertOriginal}
                className="px-4 py-2.5 border border-neutral-700 hover:border-white text-xs font-mono uppercase tracking-wider text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
              >
                <RotateCcw size={13} />
                <span>Keep Original</span>
              </button>

              <button
                type="button"
                onClick={handleApplyRetouched}
                disabled={isRendering || !previewUrl}
                className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-mono uppercase tracking-wider font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                <Sparkles size={14} />
                <span>Apply Studio Redesign to {slotLabel}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
