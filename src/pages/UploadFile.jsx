import { useEffect, useRef, useState } from "react";
import { APP_URL } from "../Constansts";
import ResultComponent from "../components/ResultComponent";

function UploadFile({ mode, onBack }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      setCameraActive(true);
    } catch (error) {
      console.error("Camera error:", error);
      alert("Camera could not be opened. Please allow camera permission.");
    }
  };
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setCameraActive(false);
  };
  useEffect(() => {
    if (mode === "camera") {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mode]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((error) => {
        console.error("Video play error:", error);
      });
    }
  }, [stream, cameraActive]);

  // ------------------------------------------------
  // FILE SELECTION & CAPTURE
  // ------------------------------------------------

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const imageURL = URL.createObjectURL(file);
    setSelectedImage({ file, url: imageURL });
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageURL = canvas.toDataURL("image/jpeg");
    setSelectedImage({ url: imageURL });
    stopCamera();
  };

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

  const analyzeCompliance = async () => {
    if (!selectedImage) {
      alert("Please select or capture an image first.");
      return;
    }

    setAnalyzing(true);

    // try {
    const formData = new FormData();
    let data = {
      filename: "Kurkure.jpeg",
      barcode: {
        detected: true,
        items: [
          {
            type: "EAN13",
            data: "8901491001786",
          },
        ],
      },
      compliance: {
        status: "NON-COMPLIANT",
        fields: {
          manufacturer_details: "PepsiCo India Holdings Pvt. Ltd.",
          commodity_name: "POTATO CHIPS",
          net_quantity: "48g",
          date_of_manufacture: null,
          retail_sale_price: null,
          consumer_care:
            "The CONSUMER SERVICES MANAGER, PEPSICO INDIA HOLDINGS PVT. LTD., P.O. BOX 27, DLF QUTAB ENCLAVE, PHASE -1, GURUGRAM - 122002, HARYANA, INDIA OR CALL US AT 1800 22 4020 OR EMAIL US AT CONSUMER.FEEDBACK@PEPSICO.COM",
        },
        detected_text: "```xml\n\n\n\n\n\n\n```",
        raw_model_output:
          "```xml\n<MANUFACTURER>PepsiCo India Holdings Pvt. Ltd.</MANUFACTURER>\n<COMMODITY>POTATO CHIPS</COMMODITY>\n<NET_QUANTITY>48g</NET_QUANTITY>\n<DATE>MISSING</DATE>\n<MRP>MISSING</MRP>\n<CONSUMER_CARE>The CONSUMER SERVICES MANAGER, PEPSICO INDIA HOLDINGS PVT. LTD., P.O. BOX 27, DLF QUTAB ENCLAVE, PHASE -1, GURUGRAM - 122002, HARYANA, INDIA OR CALL US AT 1800 22 4020 OR EMAIL US AT CONSUMER.FEEDBACK@PEPSICO.COM</CONSUMER_CARE>\n```",
        passed: [
          {
            field: "manufacturer_details",
            rule: "Rule 6(1)(a): Name & Address of Mfg/Packer",
            value: "PepsiCo India Holdings Pvt. Ltd.",
          },
          {
            field: "commodity_name",
            rule: "Rule 6(1)(b): Generic/Common Commodity Name",
            value: "POTATO CHIPS",
          },
          {
            field: "net_quantity",
            rule: "Rule 6(1)(c): Net Quantity (Weight/Measure/Count)",
            value: "48g",
          },
          {
            field: "consumer_care",
            rule: "Rule 6(2): Consumer Complaint Contact Details",
            value:
              "The CONSUMER SERVICES MANAGER, PEPSICO INDIA HOLDINGS PVT. LTD., P.O. BOX 27, DLF QUTAB ENCLAVE, PHASE -1, GURUGRAM - 122002, HARYANA, INDIA OR CALL US AT 1800 22 4020 OR EMAIL US AT CONSUMER.FEEDBACK@PEPSICO.COM",
          },
        ],
        violations: [
          {
            field: "date_of_manufacture",
            rule: "Rule 6(1)(d): Month & Year of Packing/Mfg",
            value: null,
          },
          {
            field: "retail_sale_price",
            rule: "Rule 6(1)(e): Maximum Retail Price (MRP)",
            value: null,
          },
        ],
        passed_count: 4,
        violation_count: 2,
        total_checks: 6,
        compliant: false,
        overall_evaluation:
          "NON-COMPLIANT: Missing or incomplete statutory declarations.",
      },
    };
    setResult(data);
    //   if (selectedImage.file) {
    //     formData.append("file", selectedImage.file);
    //   } else {
    //     const response = await fetch(selectedImage.url);
    //     const blob = await response.blob();
    //     formData.append("file", blob, "camera-capture.jpg");
    //   }
    //   const apiResponse = await fetch(`${APP_URL}/scan`, {
    //     method: "POST",
    //     body: formData,
    //   });
    //   if (!apiResponse.ok) {
    //     throw new Error("Failed to analyze image");
    //   }
    //   const data = await apiResponse.json();
    //   setResult(data);
    // } catch (error) {
    //   console.error("API Error:", error);
    //   alert(
    //     "Something went wrong while analyzing the image. Please try again.",
    //   );
    // } finally {
    //   setAnalyzing(false);
    // }
    setAnalyzing(false);
  };

  if (result) {
    return <ResultComponent result={result} selectedImage={selectedImage} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">LegalMetriScan</h1>
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
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {mode === "camera" ? "Scan Product Label" : "Upload Product Image"}
          </h2>
          <p className="mt-3 text-gray-500">
            Make sure the product declarations are clearly visible.
          </p>
        </div>

        {mode === "camera" && cameraActive && (
          <div className="mt-8 rounded-2xl border bg-white p-5 shadow-sm">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-auto max-h-150 w-full rounded-xl bg-black object-cover"
            />
            <button
              onClick={captureImage}
              className="mt-5 w-full rounded-xl bg-green-600 px-6 py-4 font-semibold text-white hover:bg-green-700"
            >
              📷 Capture Image
            </button>
          </div>
        )}

        {mode === "upload" && !selectedImage && (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <div className="text-5xl">🖼️</div>
            <h3 className="mt-5 text-xl font-bold text-gray-800">
              Upload Product Image
            </h3>
            <p className="mt-2 text-gray-500">JPG, JPEG or PNG</p>
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
                {analyzing ? "Analyzing..." : "Analyze Compliance"}
              </button>
            </div>
          </div>
        )}

        {mode === "camera" && !cameraActive && !selectedImage && (
          <div className="mt-10 rounded-xl bg-white p-8 text-center">
            <p className="text-gray-500">Starting camera...</p>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </main>
    </div>
  );
}

// ------------------------------------------------
// DETAIL COMPONENT
// ------------------------------------------------

function Detail({ label, value }) {
  const isMissing = !value || value === "MISSING";

  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p
        className={`mt-1 font-semibold ${
          isMissing ? "text-red-500 italic" : "text-gray-900"
        }`}
      >
        {isMissing ? "Not detected" : value}
      </p>
    </div>
  );
}

export default UploadFile;
