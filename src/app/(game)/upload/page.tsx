"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Cropper from "react-easy-crop";
import { Button, Card, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import type { Area } from "react-easy-crop";

type TrackSource = "UPLOAD" | "SOUNDCLOUD" | "YOUTUBE";

interface FormState {
  title: string;
  artist: string;
  audioUrl: string;
  coverUrl: string;
  source: TrackSource;
  sourceUrl: string;
}

export default function SubmitPage() {
  const router = useRouter();
  const [step, setStep] = useState<"source" | "details" | "confirm">("source");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [dragActiveCover, setDragActiveCover] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<FormState>({
    title: "",
    artist: "",
    audioUrl: "",
    coverUrl: "",
    source: "UPLOAD",
    sourceUrl: "",
  });

  const inferMetaFromFilename = (name: string) => {
    const base = name.replace(/\.[^/.]+$/, "").trim();
    const parts = base.split(" - ");
    if (parts.length >= 2) {
      return {
        artist: parts[0].trim(),
        title: parts.slice(1).join(" - ").trim(),
      };
    }
    return { title: base, artist: "" };
  };

  const uploadFile = async (file: File) => {
    setUploadingFile(true);
    setUploadError(null);
    try {
      const body = new FormData();
      body.append("file", file);

      const response = await apiFetch("/api/uploads", {
        method: "POST",
        body,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }

      const data = await response.json();
      const meta = inferMetaFromFilename(file.name);

      setForm((prev) => ({
        ...prev,
        audioUrl: data.url || prev.audioUrl,
        title: prev.title || meta.title,
        artist: prev.artist || meta.artist,
        source: "UPLOAD",
      }));
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Upload failed"
      );
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    void uploadFile(file);
  };

  const uploadCoverImage = async (file: File) => {
    setUploadingCover(true);
    setCoverUploadError(null);
    try {
      const body = new FormData();
      body.append("file", file);

      const response = await apiFetch("/api/uploads", {
        method: "POST",
        body,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }

      const data = await response.json();

      setForm((prev) => ({
        ...prev,
        coverUrl: data.url || prev.coverUrl,
      }));
    } catch (error) {
      setCoverUploadError(
        error instanceof Error ? error.message : "Upload failed"
      );
    } finally {
      setUploadingCover(false);
    }
  };

  const handleCoverFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new window.Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No 2d context");
    }

    canvas.width = 3000;
    canvas.height = 3000;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      3000,
      3000
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        resolve(blob);
      }, "image/jpeg", 0.95);
    });
  };

  const handleCropConfirm = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    try {
      setUploadingCover(true);
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const file = new File([croppedBlob], "cover.jpg", { type: "image/jpeg" });

      await uploadCoverImage(file);
      setImageToCrop(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch (error) {
      setCoverUploadError(
        error instanceof Error ? error.message : "Crop failed"
      );
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSourceSelect = (source: TrackSource) => {
    setForm((prev) => ({ ...prev, source }));
    setStep("details");
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await apiFetch("/api/drops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          artist: form.artist || null,
          audioUrl: form.audioUrl,
          coverUrl: form.coverUrl || null,
          source: form.source,
          sourceUrl: form.sourceUrl || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit track");
      }

      router.push("/selection");
    } catch (error) {
      console.error("Failed to submit track:", error);
      alert(error instanceof Error ? error.message : "Failed to submit track");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = form.title.trim() && form.audioUrl.trim();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-2xl font-bold uppercase tracking-wide">
          Submit Track
        </h1>
      </div>

      {/* Step 1: Source Selection */}
      {step === "source" && (
        <div className="space-y-4">
          <h2 className="text-lg uppercase tracking-wider mb-6 text-foreground/60">
            Select source
          </h2>

          <button
            onClick={() => handleSourceSelect("SOUNDCLOUD")}
            className="w-full text-left"
          >
            <div className="border border-border hover:border-foreground p-4 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-foreground/20 flex items-center justify-center text-xs uppercase tracking-wider">
                  SC
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">SoundCloud</h3>
                  <p className="text-sm text-foreground/60">
                    Import from URL
                  </p>
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleSourceSelect("YOUTUBE")}
            className="w-full text-left"
          >
            <div className="border border-border hover:border-foreground p-4 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-foreground/20 flex items-center justify-center text-xs uppercase tracking-wider">
                  YT
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">YouTube</h3>
                  <p className="text-sm text-foreground/60">
                    Import from URL
                  </p>
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleSourceSelect("UPLOAD")}
            className="w-full text-left"
          >
            <div className="border border-border hover:border-foreground p-4 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-foreground/20 flex items-center justify-center text-xs uppercase tracking-wider">
                  UP
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Direct Upload</h3>
                  <p className="text-sm text-foreground/60">
                    Upload file or URL
                  </p>
                </div>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Step 2: Track Details */}
      {step === "details" && (
        <div className="space-y-6">
          <button
            onClick={() => setStep("source")}
            className="text-foreground/60 hover:text-foreground text-sm flex items-center gap-2"
          >
            ← Back
          </button>

          <div className="border border-border p-6">
            {/* File Upload for UPLOAD source */}
            {form.source === "UPLOAD" && (
              <div className="mb-6">
                <label className="block text-sm uppercase tracking-wider mb-2 text-foreground/60">
                  Audio file
                </label>
                <div
                  className={cn(
                    "w-full border border-border bg-background px-4 py-8 text-center transition cursor-pointer",
                    dragActive && "border-foreground"
                  )}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    handleFiles(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                  <p className="text-sm text-foreground/60">
                    Select file or drag
                  </p>
                  {uploadingFile && (
                    <p className="text-xs text-foreground/60 mt-2">
                      Processing
                    </p>
                  )}
                  {uploadError && (
                    <p className="text-xs text-foreground/60 mt-2">
                      Upload failed
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Source URL (for import) */}
            {form.source !== "UPLOAD" && (
              <div className="mb-6">
                <label className="block text-sm uppercase tracking-wider mb-2 text-foreground/60">
                  {form.source === "SOUNDCLOUD" ? "SoundCloud" : "YouTube"} URL
                </label>
                <input
                  type="url"
                  value={form.sourceUrl}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, sourceUrl: e.target.value }))
                  }
                  placeholder={
                    form.source === "SOUNDCLOUD"
                      ? "https://soundcloud.com/artist/track"
                      : "https://youtube.com/watch?v=..."
                  }
                  className="w-full px-4 py-3 bg-background border border-border focus:border-foreground focus:outline-none"
                />
              </div>
            )}

            {/* Audio URL */}
            <div className="mb-6">
              <label className="block text-sm uppercase tracking-wider mb-2 text-foreground/60">
                Audio URL <span className="text-foreground">*</span>
              </label>
              <input
                type="url"
                value={form.audioUrl}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, audioUrl: e.target.value }))
                }
                placeholder="https://example.com/track.mp3"
                className="w-full px-4 py-3 bg-background border border-border focus:border-foreground focus:outline-none"
              />
            </div>

            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm uppercase tracking-wider mb-2 text-foreground/60">
                Title <span className="text-foreground">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Track title"
                className="w-full px-4 py-3 bg-background border border-border focus:border-foreground focus:outline-none"
              />
            </div>

            {/* Artist */}
            <div className="mb-6">
              <label className="block text-sm uppercase tracking-wider mb-2 text-foreground/60">
                Artist
              </label>
              <input
                type="text"
                value={form.artist}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, artist: e.target.value }))
                }
                placeholder="Artist name"
                className="w-full px-4 py-3 bg-background border border-border focus:border-foreground focus:outline-none"
              />
            </div>

            {/* Cover Image Upload */}
            <div>
              <label className="block text-sm uppercase tracking-wider mb-2 text-foreground/60">
                Cover Image
              </label>
              {form.coverUrl ? (
                <div className="w-48 mx-auto">
                  <div className="border border-border bg-background p-2 mb-2">
                    <div className="relative w-full aspect-square">
                      <Image
                        src={form.coverUrl}
                        alt="Cover preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, coverUrl: "" }));
                      if (coverInputRef.current) {
                        coverInputRef.current.value = "";
                      }
                    }}
                    className="w-full"
                  >
                    Change Image
                  </Button>
                </div>
              ) : (
                <div
                  className={cn(
                    "w-48 border border-border bg-background transition cursor-pointer mx-auto px-4 py-8 text-center",
                    dragActiveCover && "border-foreground"
                  )}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActiveCover(true);
                  }}
                  onDragLeave={() => setDragActiveCover(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActiveCover(false);
                    handleCoverFiles(e.dataTransfer.files);
                  }}
                  onClick={() => coverInputRef.current?.click()}
                >
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleCoverFiles(e.target.files)}
                  />
                  <p className="text-sm text-foreground/60">
                    Select image or drag
                  </p>
                  {uploadingCover && (
                    <p className="text-xs text-foreground/60 mt-2">
                      Processing
                    </p>
                  )}
                  {coverUploadError && (
                    <p className="text-xs text-foreground/60 mt-2">
                      Upload failed
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep("source")}>
              Back
            </Button>
            <Button
              variant="primary"
              disabled={!canProceed}
              onClick={() => setStep("confirm")}
              className="uppercase tracking-wider"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === "confirm" && (
        <div className="space-y-6">
          <h2 className="text-lg uppercase tracking-wider text-foreground/60">
            Confirm submission
          </h2>

          <div className="border border-border p-6">
            <div className="flex gap-4">
              {/* Cover Preview */}
              <div className="relative w-20 h-20 overflow-hidden bg-card flex-shrink-0">
                {form.coverUrl ? (
                  <Image
                    src={form.coverUrl}
                    alt={form.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-foreground/10 flex items-center justify-center text-xs uppercase tracking-wider text-foreground/40">
                    —
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{form.title}</h3>
                <p className="text-foreground/60 text-sm">
                  {form.artist || "Unknown"}
                </p>
                <p className="text-xs text-foreground/40 mt-2 uppercase tracking-wider">
                  {form.source}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="text-sm text-foreground/60 space-y-1">
                <p>Track enters selection pool</p>
                <p>Outcome determined by voting</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep("details")}>
              Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              loading={isSubmitting}
              onClick={handleSubmit}
              className="uppercase tracking-wider"
            >
              Submit
            </Button>
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {imageToCrop && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="w-full max-w-4xl mx-auto p-8">
            <div className="bg-background border border-border p-6">
              <h2 className="text-lg uppercase tracking-wider mb-4 text-foreground/60">
                Position Image
              </h2>

              <div className="relative w-full h-[500px] bg-black/50 mb-4">
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  zoomWithScroll={true}
                  showGrid={false}
                  style={{
                    containerStyle: {
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    },
                    cropAreaStyle: {
                      border: '2px solid rgba(255, 255, 255, 0.5)',
                    },
                  }}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm uppercase tracking-wider mb-2 text-foreground/60">
                  Zoom: {zoom.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={5}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <p className="text-xs text-foreground/40 mb-6">
                Output: 3000×3000px • Drag to reposition • Scroll to zoom
              </p>

              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setImageToCrop(null);
                    setCrop({ x: 0, y: 0 });
                    setZoom(1);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCropConfirm}
                  loading={uploadingCover}
                  className="uppercase tracking-wider"
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
