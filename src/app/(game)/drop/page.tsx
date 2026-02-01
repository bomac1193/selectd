"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button, Card, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

type DropSource = "UPLOAD" | "SOUNDCLOUD" | "YOUTUBE";

interface FormState {
  title: string;
  artist: string;
  audioUrl: string;
  coverUrl: string;
  source: DropSource;
  sourceUrl: string;
}

export default function DropPage() {
  const router = useRouter();
  const [step, setStep] = useState<"source" | "details" | "confirm">("source");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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

  const handleSourceSelect = (source: DropSource) => {
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
        throw new Error(error.error || "Failed to drop track");
      }

      router.push("/selection");
    } catch (error) {
      console.error("Failed to drop track:", error);
      alert(error instanceof Error ? error.message : "Failed to drop track");
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

            {/* Cover URL */}
            <div>
              <label className="block text-sm uppercase tracking-wider mb-2 text-foreground/60">
                Cover Image URL
              </label>
              <input
                type="url"
                value={form.coverUrl}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, coverUrl: e.target.value }))
                }
                placeholder="https://example.com/cover.jpg"
                className="w-full px-4 py-3 bg-background border border-border focus:border-foreground focus:outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep("source")}>
              Back
            </Button>
            <Button
              variant="default"
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
              variant="default"
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
    </div>
  );
}
