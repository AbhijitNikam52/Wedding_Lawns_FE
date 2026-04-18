import { useState, useRef } from "react";
import { uploadLawnPhotos, deleteLawnPhoto, reorderLawnPhotos } from "../../services/uploadService";
import toast from "react-hot-toast";

const PhotoUploader = ({ lawnId, initialPhotos = [], onPhotosChange }) => {
  const [photos,    setPhotos]    = useState(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [deleting,  setDeleting]  = useState(null); // URL of photo being deleted
  const [dragOver,  setDragOver]  = useState(false);
  const inputRef = useRef();

  const MAX = 10;

  // ── Upload handler ───────────────────────────────────────
  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;

    const remaining = MAX - photos.length;
    if (remaining <= 0) {
      return toast.error(`Maximum ${MAX} photos allowed`);
    }

    const toUpload = Array.from(files).slice(0, remaining);

    // Client-side size validation
    const oversized = toUpload.filter((f) => f.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      return toast.error(`${oversized.length} file(s) exceed 5 MB limit`);
    }

    setUploading(true);
    try {
      const data = await uploadLawnPhotos(lawnId, toUpload);
      setPhotos(data.photos);
      onPhotosChange?.(data.photos);
      toast.success(`${toUpload.length} photo(s) uploaded!`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  // ── Delete handler ───────────────────────────────────────
  const handleDelete = async (photoUrl) => {
    if (!window.confirm("Delete this photo?")) return;
    setDeleting(photoUrl);
    try {
      const data = await deleteLawnPhoto(lawnId, photoUrl);
      setPhotos(data.photos);
      onPhotosChange?.(data.photos);
      toast.success("Photo deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  // ── Drag-and-drop ────────────────────────────────────────
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  // ── Move photo left/right (simple reorder) ───────────────
  const movePhoto = async (index, direction) => {
    const newPhotos = [...photos];
    const swapIdx   = index + direction;
    if (swapIdx < 0 || swapIdx >= newPhotos.length) return;
    [newPhotos[index], newPhotos[swapIdx]] = [newPhotos[swapIdx], newPhotos[index]];
    setPhotos(newPhotos);
    try {
      await reorderLawnPhotos(lawnId, newPhotos);
      onPhotosChange?.(newPhotos);
    } catch {
      toast.error("Failed to save order");
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          dragOver
            ? "border-primary bg-purple-50"
            : "border-gray-200 hover:border-primary hover:bg-purple-50"
        } ${photos.length >= MAX ? "opacity-40 cursor-not-allowed pointer-events-none" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading || photos.length >= MAX}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 border-4 border-purple-200 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-primary font-medium">Uploading...</p>
          </div>
        ) : (
          <>
            <div className="text-4xl mb-2">📸</div>
            <p className="font-semibold text-dark text-sm">
              {photos.length >= MAX
                ? "Maximum 10 photos reached"
                : "Click or drag photos here to upload"}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              JPEG, PNG, WebP · Max 5 MB each · Up to {MAX - photos.length} more
            </p>
          </>
        )}
      </div>

      {/* Photo grid with delete + reorder */}
      {photos.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold text-dark">
              {photos.length} / {MAX} photos
              {photos.length > 0 && (
                <span className="text-xs text-gray-400 ml-2 font-normal">
                  (first photo is the thumbnail)
                </span>
              )}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((url, i) => (
              <div key={url} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-50">
                {/* Thumbnail badge */}
                {i === 0 && (
                  <span className="absolute top-1.5 left-1.5 bg-secondary text-dark text-xs font-bold px-2 py-0.5 rounded-full z-10">
                    Cover
                  </span>
                )}

                <img
                  src={url}
                  alt={`Lawn photo ${i + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {/* Move left */}
                  {i > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); movePhoto(i, -1); }}
                      className="bg-white text-dark w-7 h-7 rounded-full text-sm font-bold hover:bg-gray-100 flex items-center justify-center"
                      title="Move left"
                    >
                      ‹
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(url); }}
                    disabled={deleting === url}
                    className="bg-red-500 text-white w-7 h-7 rounded-full text-sm flex items-center justify-center hover:bg-red-600 disabled:opacity-50"
                    title="Delete photo"
                  >
                    {deleting === url ? "…" : "✕"}
                  </button>

                  {/* Move right */}
                  {i < photos.length - 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); movePhoto(i, 1); }}
                      className="bg-white text-dark w-7 h-7 rounded-full text-sm font-bold hover:bg-gray-100 flex items-center justify-center"
                      title="Move right"
                    >
                      ›
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUploader;