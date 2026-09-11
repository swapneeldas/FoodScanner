import { useEffect, useRef, useState } from "react";

function UploadFile({ mode, onBack }) {

  const [selectedImage, setSelectedImage] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);


  // ------------------------------------------------
  // CAMERA
  // ------------------------------------------------

 const startCamera = async () => {
  try {
    const mediaStream =
      await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: "environment",
          },
          width: {
            ideal: 1280,
          },
          height: {
            ideal: 720,
          },
        },
        audio: false,
      });

    setStream(mediaStream);
    setCameraActive(true);

  } catch (error) {
    console.error("Camera error:", error);

    alert(
      "Camera could not be opened. Please allow camera permission."
    );
  }
};
  // ------------------------------------------------
  // STOP CAMERA
  // ------------------------------------------------

  const stopCamera = () => {

    if (stream) {

      stream.getTracks().forEach((track) => {
        track.stop();
      });

    }

    setStream(null);
    setCameraActive(false);
  };


  // -----------------------------
// START CAMERA WHEN MODE = CAMERA
// -----------------------------

useEffect(() => {
  if (mode === "camera") {
    startCamera();
  }

  return () => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    }
  };
}, [mode]);


// -----------------------------
// CONNECT STREAM TO VIDEO
// -----------------------------

useEffect(() => {
  if (videoRef.current && stream) {
    videoRef.current.srcObject = stream;

    videoRef.current
      .play()
      .catch((error) => {
        console.error("Video play error:", error);
      });
  }
}, [stream, cameraActive]);

  // ------------------------------------------------
  // FILE SELECTION
  // ------------------------------------------------

  const handleFileChange = (event) => {

    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const imageURL = URL.createObjectURL(file);

    setSelectedImage({
      file: file,
      url: imageURL
    });

  };


  // ------------------------------------------------
  // CAPTURE CAMERA IMAGE
  // ------------------------------------------------

  const captureImage = () => {

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const imageURL = canvas.toDataURL("image/jpeg");

    setSelectedImage({
      url: imageURL
    });

    stopCamera();

  };


  // ------------------------------------------------
  // RESET
  // ------------------------------------------------

  const resetImage = () => {

    setSelectedImage(null);
    setResult(null);

    if (mode === "camera") {
      startCamera();
    }

  };


  // ------------------------------------------------
  // ANALYZE IMAGE
  // ------------------------------------------------

  const analyzeCompliance = () => {

    if (!selectedImage) {
      alert("Please select or capture an image first.");
      return;
    }

    setAnalyzing(true);

    // Temporary dummy analysis
    // Later this will call your AI/backend API.

    setTimeout(() => {

      setResult({

        score: 72,

        status: "Non-Compliant",

        productName: "Sample Packaged Commodity",

        details: {

          manufacturer:
            "ABC Foods Pvt. Ltd.",

          netQuantity:
            "5 kg",

          mrp:
            "₹450",

          packingDate:
            "08/2026",

          consumerCare:
            "Not detected"

        },

        checks: [

          {
            name: "Manufacturer / Packer Details",
            status: "passed"
          },

          {
            name: "Net Quantity",
            status: "passed"
          },

          {
            name: "MRP Declaration",
            status: "passed"
          },

          {
            name: "Packing Date",
            status: "passed"
          },

          {
            name: "Consumer Care Details",
            status: "failed"
          }

        ],

        violations: [

          "Consumer care details were not detected.",

          "Some mandatory declarations may require manual verification."

        ]

      });

      setAnalyzing(false);

    }, 2000);

  };


  // ------------------------------------------------
  // RESULT PAGE
  // ------------------------------------------------

  if (result) {

    return (

      <div className="min-h-screen bg-gray-50">

        {/* Header */}
        <header className="border-b bg-white">

          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">

            <div>

              <h1 className="text-2xl font-bold text-gray-900">
                LegalMetriScan
              </h1>

              <p className="text-sm text-gray-500">
                Compliance Result
              </p>

            </div>

          </div>

        </header>


        <main className="mx-auto max-w-4xl px-6 py-10">

          {/* Back */}
          <button
            onClick={() => {
              setResult(null);
              setSelectedImage(null);
              onBack();
            }}
            className="mb-8 text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            ← Back to Scanner
          </button>


          {/* Result heading */}
          <div className="mb-8">

            <h2 className="text-3xl font-bold text-gray-900">
              Compliance Result
            </h2>

            <p className="mt-2 text-gray-500">
              Analysis of the uploaded product label
            </p>

          </div>


          {/* Main result */}
          <div className="grid gap-6 md:grid-cols-2">


            {/* Image */}
            <div className="rounded-2xl border bg-white p-5">

              <h3 className="mb-4 font-semibold text-gray-800">
                Scanned Image
              </h3>

              <img
                src={selectedImage?.url}
                alt="Scanned product"
                className="max-h-96 w-full rounded-xl object-contain"
              />

            </div>


            {/* Score */}
            <div className="rounded-2xl border bg-white p-6">

              <h3 className="font-semibold text-gray-800">
                Compliance Score
              </h3>

              <div className="mt-8 text-center">

                <div className="text-6xl font-bold text-orange-500">
                  {result.score}
                </div>

                <div className="mt-2 text-gray-500">
                  out of 100
                </div>

                <div className="mt-6 inline-block rounded-full bg-red-100 px-5 py-2 font-semibold text-red-700">
                  ✕ {result.status}
                </div>

              </div>

            </div>

          </div>


          {/* Product details */}
          <div className="mt-6 rounded-2xl border bg-white p-6">

            <h3 className="text-xl font-bold text-gray-900">
              Extracted Product Information
            </h3>

            <div className="mt-5 grid gap-4 md:grid-cols-2">

              <Detail
                label="Product Name"
                value={result.productName}
              />

              <Detail
                label="Manufacturer / Packer"
                value={result.details.manufacturer}
              />

              <Detail
                label="Net Quantity"
                value={result.details.netQuantity}
              />

              <Detail
                label="MRP"
                value={result.details.mrp}
              />

              <Detail
                label="Packing Date"
                value={result.details.packingDate}
              />

              <Detail
                label="Consumer Care"
                value={result.details.consumerCare}
              />

            </div>

          </div>


          {/* Compliance checks */}
          <div className="mt-6 rounded-2xl border bg-white p-6">

            <h3 className="text-xl font-bold text-gray-900">
              Compliance Checks
            </h3>

            <div className="mt-5 space-y-3">

              {result.checks.map((check, index) => (

                <div
                  key={index}
                  className="flex items-center justify-between rounded-xl border p-4"
                >

                  <span className="font-medium text-gray-700">
                    {check.name}
                  </span>

                  {check.status === "passed" ? (

                    <span className="rounded-full bg-green-100 px-4 py-1 text-sm font-semibold text-green-700">
                      ✓ Passed
                    </span>

                  ) : (

                    <span className="rounded-full bg-red-100 px-4 py-1 text-sm font-semibold text-red-700">
                      ✕ Failed
                    </span>

                  )}

                </div>

              ))}

            </div>

          </div>


          {/* Violations */}
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">

            <h3 className="text-xl font-bold text-red-800">
              ⚠ Violations / Warnings
            </h3>

            <div className="mt-4 space-y-3">

              {result.violations.map((violation, index) => (

                <div
                  key={index}
                  className="rounded-lg bg-white p-4 text-red-700"
                >
                  {violation}
                </div>

              ))}

            </div>

          </div>


          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">

            <button
              onClick={() => {
                setResult(null);
                setSelectedImage(null);

                if (mode === "camera") {
                  startCamera();
                }
              }}
              className="flex-1 rounded-xl bg-green-600 px-6 py-4 font-semibold text-white hover:bg-green-700"
            >
              Scan Another Product
            </button>


            <button
              onClick={() => alert("Full report feature will be added later.")}
              className="flex-1 rounded-xl border border-gray-300 bg-white px-6 py-4 font-semibold text-gray-700 hover:bg-gray-50"
            >
              View Full Report
            </button>

          </div>

        </main>

      </div>

    );

  }


  // ------------------------------------------------
  // SCANNER PAGE
  // ------------------------------------------------

  return (

    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="border-b bg-white">

        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">

          <div>

            <h1 className="text-2xl font-bold text-gray-900">
              LegalMetriScan
            </h1>

            <p className="text-sm text-gray-500">
              Packaged Commodity Compliance Checker
            </p>

          </div>

          <button
            onClick={onBack}
            className="text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            ← Home
          </button>

        </div>

      </header>


      <main className="mx-auto max-w-3xl px-6 py-10">


        {/* Title */}
        <div className="text-center">

          <h2 className="text-3xl font-bold text-gray-900">
            {mode === "camera"
              ? "Scan Product Label"
              : "Upload Product Image"}
          </h2>

          <p className="mt-3 text-gray-500">
            Make sure the product declarations are clearly visible.
          </p>

        </div>


        {/* Camera */}
        {mode === "camera" && cameraActive && (

          <div className="mt-8 rounded-2xl border bg-white p-5 shadow-sm">

           <video
             ref={videoRef}
             autoPlay
             playsInline
             muted
             className="h-auto max-h-[600px] w-full rounded-xl bg-black object-cover"
           />

            <button
              onClick={captureImage}
              className="mt-5 w-full rounded-xl bg-green-600 px-6 py-4 font-semibold text-white hover:bg-green-700"
            >
              📷 Capture Image
            </button>

          </div>

        )}


        {/* Upload */}
        {mode === "upload" && !selectedImage && (

          <div className="mt-8 rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">

            <div className="text-5xl">
              🖼️
            </div>

            <h3 className="mt-5 text-xl font-bold text-gray-800">
              Upload Product Image
            </h3>

            <p className="mt-2 text-gray-500">
              JPG, JPEG or PNG
            </p>

            <button
              onClick={() => fileInputRef.current.click()}
              className="mt-6 rounded-xl bg-green-600 px-7 py-3 font-semibold text-white hover:bg-green-700"
            >
              Choose Image
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

          </div>

        )}


        {/* Preview */}
        {selectedImage && (

          <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">

            <h3 className="mb-4 text-lg font-bold text-gray-800">
              Product Image
            </h3>

            <img
              src={selectedImage.url}
              alt="Selected product"
              className="mx-auto max-h-96 rounded-xl object-contain"
            />


            {/* Buttons */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">

              <button
                onClick={resetImage}
                className="flex-1 rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Choose Another
              </button>

              <button
                onClick={analyzeCompliance}
                disabled={analyzing}
                className="flex-1 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {analyzing
                  ? "Analyzing..."
                  : "Analyze Compliance"}
              </button>

            </div>

          </div>

        )}


        {/* Camera loading */}
        {mode === "camera" && !cameraActive && !selectedImage && (

          <div className="mt-10 rounded-xl bg-white p-8 text-center">

            <p className="text-gray-500">
              Starting camera...
            </p>

          </div>

        )}


        {/* Hidden canvas */}
        <canvas
          ref={canvasRef}
          className="hidden"
        />

      </main>

    </div>

  );
}


// ------------------------------------------------
// DETAIL COMPONENT
// ------------------------------------------------

function Detail({ label, value }) {

  return (

    <div className="rounded-xl bg-gray-50 p-4">

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-gray-900">
        {value}
      </p>

    </div>

  );

}


export default UploadFile;