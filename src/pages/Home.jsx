import { useState } from "react";
import UploadFile from "./UploadFile";

function Home() {
  const [mode, setMode] = useState(null);

  // Open scanner when user selects Camera or Upload
  if (mode) {
    return (
      <UploadFile
        mode={mode}
        onBack={() => setMode(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              LegalMetriScan
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Packaged Commodity Compliance Checker
            </p>
          </div>

          <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
            Legal Metrology
          </span>

        </div>
      </header>


      {/* Main */}
      <main className="mx-auto max-w-4xl px-6 py-16">

        {/* Logo / Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
          ⚖️
        </div>


        {/* Title */}
        <div className="mx-auto mt-6 max-w-2xl text-center">

          <h2 className="text-4xl font-bold tracking-tight text-gray-900">
            Check Product Compliance
          </h2>

          <p className="mt-4 text-lg leading-8 text-gray-600">
            Scan or upload a packaged commodity label to check
            whether its mandatory declarations comply with
            Legal Metrology requirements.
          </p>

        </div>


        {/* Question */}
        <div className="mt-12">

          <h3 className="mb-6 text-center text-xl font-semibold text-gray-800">
            How would you like to check the product?
          </h3>


          {/* Two choices */}
          <div className="grid gap-6 md:grid-cols-2">


            {/* CAMERA */}
            <button
              onClick={() => setMode("camera")}
              className="rounded-2xl border-2 border-gray-200 bg-white p-8 text-left shadow-sm transition duration-200 hover:border-green-500 hover:shadow-lg"
            >

              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-green-100 text-3xl">
                📷
              </div>

              <h4 className="mt-6 text-xl font-bold text-gray-900">
                Use Camera
              </h4>

              <p className="mt-2 leading-6 text-gray-500">
                Capture the product label directly using your
                device camera.
              </p>

              <p className="mt-6 font-semibold text-green-600">
                Open Camera →
              </p>

            </button>


            {/* UPLOAD */}
            <button
              onClick={() => setMode("upload")}
              className="rounded-2xl border-2 border-gray-200 bg-white p-8 text-left shadow-sm transition duration-200 hover:border-blue-500 hover:shadow-lg"
            >

              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-100 text-3xl">
                🖼️
              </div>

              <h4 className="mt-6 text-xl font-bold text-gray-900">
                Upload Image
              </h4>

              <p className="mt-2 leading-6 text-gray-500">
                Select an existing product or label image
                from your device.
              </p>

              <p className="mt-6 font-semibold text-blue-600">
                Select Image →
              </p>

            </button>

          </div>

        </div>


        {/* Information */}
        <div className="mt-10 rounded-xl border border-gray-200 bg-white p-5 text-center text-sm leading-6 text-gray-500">

          The system will analyze the product label for mandatory
          declarations such as manufacturer details, net quantity,
          MRP and consumer care information.

        </div>

      </main>

    </div>
  );
}

export default Home;