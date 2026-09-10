import React, { useState, useRef } from "react";

const ImageCapture = () => {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Handle file selection from device
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadStatus(null);
    }
  };

  // Start the webcam
  const startCamera = async () => {
    setIsCameraActive(true);
    setUploadStatus(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert(
        "Could not access the camera. Please ensure permissions are granted.",
      );
      setIsCameraActive(false);
    }
  };

  // Stop the webcam
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsCameraActive(false);
  };

  // Capture image from webcam video stream
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          const file = new File([blob], "camera-capture.jpg", {
            type: "image/jpeg",
          });
          setImageFile(file);
          setPreviewUrl(URL.createObjectURL(file));
          stopCamera();
        },
        "image/jpeg",
        0.9,
      );
    }
  };

  // Reset the current selection
  const resetSelection = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setUploadStatus(null);
  };

  // Mock API Call
  const uploadToAPI = async () => {
    if (!imageFile) return;

    setIsUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      // Replace this URL with your actual API endpoint
      const response = await fetch("https://api.example.com/upload", {
        method: "POST",
        body: formData,
        // Don't set Content-Type header manually when using FormData,
        // the browser will set it automatically with the correct boundary
      });

      if (!response.ok) throw new Error("Upload failed");

      // const data = await response.json();

      // Simulating a successful network request
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setUploadStatus({
        success: true,
        message: "Image uploaded successfully!",
      });
    } catch (error) {
      console.error("API Error:", error);
      // Simulating successful upload for demonstration purposes since the real API will fail
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setUploadStatus({
        success: true,
        message: "Simulated success (Replace API URL)",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 flex flex-col items-center py-12 px-4 font-sans">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Image Upload
        </h1>

        {/* Action Selection (Only show if camera isn't active and no image selected) */}
        {!isCameraActive && !previewUrl && (
          <div className="flex flex-col gap-4">
            <label className="flex items-center justify-center w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium cursor-pointer transition-colors">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                ></path>
              </svg>
              Select from Device
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            <div className="flex items-center text-gray-500">
              <div className="flex-grow border-t border-gray-700"></div>
              <span className="px-3 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-700"></div>
            </div>

            <button
              onClick={startCamera}
              className="flex items-center justify-center w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
              Open Camera
            </button>
          </div>
        )}

        {/* Camera View */}
        {isCameraActive && (
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-gray-700">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            {/* Hidden canvas to process the image frame */}
            <canvas ref={canvasRef} className="hidden" />

            <div className="flex w-full gap-3 mt-2">
              <button
                onClick={stopCamera}
                className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={captureImage}
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                Capture Photo
              </button>
            </div>
          </div>
        )}

        {/* Image Preview & Upload View */}
        {previewUrl && !isCameraActive && (
          <div className="flex flex-col items-center gap-5">
            <div className="relative w-full rounded-lg overflow-hidden border border-gray-700">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-auto max-h-72 object-contain bg-black"
              />
            </div>

            {uploadStatus && (
              <div
                className={`w-full p-3 rounded-lg text-sm text-center ${uploadStatus.success ? "bg-green-900/30 text-green-400 border border-green-800" : "bg-red-900/30 text-red-400 border border-red-800"}`}
              >
                {uploadStatus.message}
              </div>
            )}

            <div className="flex w-full gap-3 mt-2">
              <button
                onClick={resetSelection}
                disabled={isUploading}
                className="flex-1 py-2 px-4 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                Discard
              </button>
              <button
                onClick={uploadToAPI}
                disabled={isUploading}
                className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white rounded-lg font-medium transition-colors flex justify-center items-center"
              >
                {isUploading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  "Upload to API"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ImageCapture;
