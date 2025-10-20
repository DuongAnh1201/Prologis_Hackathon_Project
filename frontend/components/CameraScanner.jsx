import { useRef, useState, useEffect } from "react";

/**
 * CameraScanner
 * Props:
 *  - onClose(): function to close the modal
 *  - onProcessed?(serverResponse): optional callback when upload succeeds
 *  - meta?: { user_id?: string; user_name?: string; pick_up_location?: string }
 */
export default function CameraScanner({ onClose, onProcessed, meta }) {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);

  const API = "https://prologis-hackathon.onrender.com";

  // ---------- Camera control ----------
  const startCamera = async () => {
    setError("");
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      console.error("Camera error:", err);
      setError(
        "Camera access denied or unavailable. You can upload a photo from your gallery."
      );
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, []);

  // ---------- Capture / Retake / Gallery ----------
  const captureImage = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    const w = videoRef.current.videoWidth || 1280;
    const h = videoRef.current.videoHeight || 720;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, w, h);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setCapturedBlob(blob);
        setPreviewUrl(url);
        stopCamera();
      },
      "image/png",
      0.95
    );
  };

  const retake = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setCapturedBlob(null);
    setUploadSuccess(false);
    setServerResponse(null);
    startCamera();
  };

  const openGallery = () => fileInputRef.current?.click();

  const onPickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setCapturedBlob(file);
    stopCamera();
  };

  // ---------- Upload to API (/process-image) ----------
  const upload = async () => {
    if (!capturedBlob) {
      setError("Please capture or select an image first.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const file =
        capturedBlob instanceof File
          ? capturedBlob
          : new File([capturedBlob], "scan.png", { type: "image/png" });

      const form = new FormData();
      form.append("file", file);
      form.append("user_id", "1");
      form.append("user_name", "Aayush");
      form.append("pick_up_location", "A7");

      const res = await fetch(`${API}/process-image`, {
        method: "POST",
        body: form,
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.message || "Upload failed");
      }

      // Success!
      setUploadSuccess(true);
      setServerResponse(payload);
      onProcessed?.(payload);
    } catch (e) {
      console.error(e);
      setError(e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    onClose();
  };

  return (
    <div className="camera-modal" role="dialog" aria-modal="true">
      {!uploadSuccess ? (
        <>
          <div className="camera-container">
            {previewUrl ? (
              <img src={previewUrl} alt="Captured" className="preview-image" />
            ) : (
              <video ref={videoRef} autoPlay playsInline className="camera-video" />
            )}
          </div>

          {error ? <div className="camera-error">{error}</div> : null}

          <div className="camera-controls">
            {!previewUrl ? (
              <>
                <button className="camera-btn capture" onClick={captureImage}>
                  📸 Capture
                </button>
                <button className="camera-btn alt" onClick={openGallery}>
                  🖼️ Gallery
                </button>
                <button className="camera-btn close" onClick={handleClose}>
                  ✕ Cancel
                </button>
              </>
            ) : (
              <>
                <button className="camera-btn upload" onClick={upload} disabled={busy}>
                  {busy ? "Uploading…" : "💾 Upload"}
                </button>
                <button className="camera-btn alt" onClick={retake} disabled={busy}>
                  🔄 Retake
                </button>
                <button className="camera-btn close" onClick={handleClose} disabled={busy}>
                  ✕ Close
                </button>
              </>
            )}
          </div>
        </>
      ) : (
        <SuccessView
          imageUrl={previewUrl}
          response={serverResponse}
          onClose={handleClose}
          onRetake={retake}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onPickFile}
        style={{ display: "none" }}
      />

      <style>{`
        .camera-modal {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.95);
          z-index: 200;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 20px;
        }

        .camera-container {
          position: relative;
          width: 100%;
          max-width: 640px;
          aspect-ratio: 4 / 3;
          background: #000;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }

        .camera-video, .preview-image {
          width: 100%; height: 100%;
          object-fit: cover;
        }

        .camera-controls {
          display: flex; gap: 12px; margin-top: 18px; flex-wrap: wrap;
          width: 100%; max-width: 640px;
        }

        .camera-btn {
          padding: 14px 20px;
          border: none; border-radius: 12px;
          font-weight: 700; font-size: 15px;
          cursor: pointer; transition: all .2s;
          color: #0f172a; background: #fff;
        }
        .camera-btn.capture { background: #2dd4bf; color: #fff; }
        .camera-btn.capture:hover { background: #14b8a6; transform: translateY(-1px); }
        .camera-btn.upload { background: #22c55e; color: #fff; }
        .camera-btn.upload:hover { background: #16a34a; transform: translateY(-1px); }
        .camera-btn.alt { background: #f1f5f9; }
        .camera-btn.alt:hover { background: #e2e8f0; }
        .camera-btn.close { background: #fff; }
        .camera-btn.close:hover { background: #f8fafc; }

        .camera-error {
          color: #fecaca; background: #7f1d1d; border: 1px solid #fca5a5;
          padding: 10px 12px; border-radius: 10px; margin-top: 12px;
          width: 100%; max-width: 640px; font-size: 14px;
        }

        .success-container {
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          background: #fff;
          border-radius: 16px;
          padding: 24px;
        }

        .success-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .success-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .success-title {
          font-size: 24px;
          font-weight: 700;
          color: #059669;
          margin-bottom: 8px;
        }

        .success-subtitle {
          font-size: 14px;
          color: #64748b;
        }

        .success-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .receipt-preview {
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid #e2e8f0;
        }

        .receipt-preview img {
          width: 100%;
          height: auto;
          display: block;
        }

        .data-section {
          background: #f8fafc;
          border-radius: 12px;
          padding: 16px;
        }

        .data-title {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e2e8f0;
        }

        .data-item {
          margin-bottom: 12px;
        }

        .data-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .data-value {
          font-size: 14px;
          color: #0f172a;
          font-weight: 500;
        }

        .products-grid {
          display: grid;
          gap: 12px;
          max-height: 300px;
          overflow-y: auto;
        }

        .product-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
        }

        .product-name {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 8px;
        }

        .product-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          font-size: 12px;
        }

        .success-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .camera-modal { padding: 12px; }
          .camera-container { max-width: 100%; border-radius: 12px; }
          .camera-controls { gap: 10px; }
          .camera-btn { flex: 1; padding: 12px 16px; font-size: 14px; }
          .success-container { padding: 16px; }
          .success-content { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

function SuccessView({ imageUrl, response, onClose, onRetake }) {
  const products = response?.data?.products || {};
  const productCount = Object.keys(products).length;

  return (
    <div className="success-container">
      <div className="success-header">
        <div className="success-icon">✅</div>
        <div className="success-title">Upload Successful!</div>
        <div className="success-subtitle">
          Your receipt has been processed and saved
        </div>
      </div>

      <div className="success-content">
        <div className="receipt-preview">
          <img src={imageUrl} alt="Uploaded receipt" />
        </div>

        <div>
          <div className="data-section" style={{ marginBottom: "16px" }}>
            <div className="data-title">User Information</div>
            <div className="data-item">
              <div className="data-label">User ID</div>
              <div className="data-value">1</div>
            </div>
            <div className="data-item">
              <div className="data-label">User Name</div>
              <div className="data-value">Aayush</div>
            </div>
            <div className="data-item">
              <div className="data-label">Pick-up Location</div>
              <div className="data-value">A7</div>
            </div>
            <div className="data-item">
              <div className="data-label">Document ID</div>
              <div className="data-value" style={{ fontSize: "11px", wordBreak: "break-all" }}>
                {response?.inserted_id || "N/A"}
              </div>
            </div>
          </div>

          <div className="data-section">
            <div className="data-title">Products ({productCount})</div>
            <div className="products-grid">
              {Object.entries(products).map(([name, details]) => (
                <div key={name} className="product-card">
                  <div className="product-name">{name}</div>
                  <div className="product-details">
                    {details.quantity && (
                      <div>
                        <div className="data-label">Qty</div>
                        <div className="data-value">{details.quantity}</div>
                      </div>
                    )}
                    {details.price && (
                      <div>
                        <div className="data-label">Price</div>
                        <div className="data-value">{details.price}</div>
                      </div>
                    )}
                    {details.pick_up_time && (
                      <div>
                        <div className="data-label">Pick-up Time</div>
                        <div className="data-value">{details.pick_up_time}</div>
                      </div>
                    )}
                    {details.drop_off_time && (
                      <div>
                        <div className="data-label">Drop-off Time</div>
                        <div className="data-value">{details.drop_off_time}</div>
                      </div>
                    )}
                    {details.pick_up_location && (
                      <div style={{ gridColumn: "1 / -1" }}>
                        <div className="data-label">Pick-up</div>
                        <div className="data-value">{details.pick_up_location}</div>
                      </div>
                    )}
                    {details.drop_off_location && (
                      <div style={{ gridColumn: "1 / -1" }}>
                        <div className="data-label">Drop-off</div>
                        <div className="data-value">{details.drop_off_location}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="success-actions">
        <button className="camera-btn alt" onClick={onRetake}>
          📸 Upload Another
        </button>
        <button className="camera-btn upload" onClick={onClose}>
          ✓ Done
        </button>
      </div>
    </div>
  );
}