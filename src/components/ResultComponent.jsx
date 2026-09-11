function Detail({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-medium ${
          value ? "text-gray-900" : "italic text-red-500"
        }`}
      >
        {value || "Not Detected / Missing"}
      </p>
    </div>
  );
}

export default function ResultComponent({ result, selectedImage }) {
  async function downloadPDF(data) {
    try {
      const response = await fetch("http://localhost:3000/generatePDF", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Convert response stream to Blob
      const blob = await response.blob();

      // Create a temporary link and trigger browser download
      const url = window.URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${data.filename?.replace(/\.[^/.]+$/, "") || "Compliance"}_Report.pdf`,
      );
      document.body.appendChild(link);
      link.click();

      // Cleanup memory and DOM
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  }
  if (result) {
    const compliance = result.result?.compliance || result.compliance || {};
    const fields = compliance.fields || {};
    const passedChecks = compliance.passed || [];
    const violationChecks = compliance.violations || [];
    const isCompliant = compliance.compliant ?? false;

    // Handles both { url: "..." } and raw string URLs
    const imageUrl =
      typeof selectedImage === "string" ? selectedImage : selectedImage?.url;

    const scorePercentage =
      compliance.total_checks > 0
        ? Math.round((compliance.passed_count / compliance.total_checks) * 100)
        : 0;

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                LegalMetriScan
              </h1>
              <p className="text-sm text-gray-500">Compliance Result</p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-6 py-10">
          <button
            onClick={() => console.log("Back to Scanner clicked")}
            className="mb-8 text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            ← Back to Scanner
          </button>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Compliance Result
            </h2>
            <p className="mt-2 text-gray-500">
              Analysis of {result.filename || "the uploaded product label"}
            </p>
          </div>

          {/* Main result & Score */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border bg-white p-5">
              <h3 className="mb-4 font-semibold text-gray-800">
                Scanned Image
              </h3>
              {selectedImage ? (
                <img
                  src={selectedImage.url}
                  alt={result.filename || "Scanned product"}
                  className="max-h-96 w-full rounded-xl object-contain"
                />
              ) : (
                <div className="flex h-64 w-full items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-400">
                  <span>{result.filename || "No image preview available"}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center rounded-2xl border bg-white p-6">
              <h3 className="font-semibold text-gray-800">Compliance Score</h3>
              <div className="mt-6 text-center">
                <div
                  className={`text-6xl font-bold ${
                    isCompliant ? "text-green-600" : "text-orange-500"
                  }`}
                >
                  {scorePercentage}%
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {compliance.passed_count} of {compliance.total_checks} checks
                  passed
                </div>

                <div
                  className={`mt-6 inline-block rounded-full px-5 py-2 font-semibold ${
                    isCompliant
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {isCompliant
                    ? "✓ COMPLIANT"
                    : `✕ ${compliance.status || "NON-COMPLIANT"}`}
                </div>

                {compliance.overall_evaluation && (
                  <p className="mt-4 text-xs text-gray-500">
                    {compliance.overall_evaluation}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Barcode details */}
          {result.barcode?.detected && result.barcode?.items?.length > 0 && (
            <div className="mt-6 rounded-2xl border bg-white p-6">
              <h3 className="text-xl font-bold text-gray-900">
                Barcode Detected
              </h3>
              <div className="mt-4 flex flex-wrap gap-4">
                {result.barcode.items.map((item, index) => (
                  <div key={index} className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs uppercase text-gray-500">
                      {item.type}
                    </p>
                    <p className="font-mono text-base font-bold text-gray-900">
                      {item.data}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Product Information */}
          <div className="mt-6 rounded-2xl border bg-white p-6">
            <h3 className="text-xl font-bold text-gray-900">
              Extracted Product Information
            </h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Detail label="Commodity Name" value={fields.commodity_name} />
              <Detail
                label="Manufacturer / Packer"
                value={fields.manufacturer_details}
              />
              <Detail label="Net Quantity" value={fields.net_quantity} />
              <Detail
                label="Maximum Retail Price (MRP)"
                value={fields.retail_sale_price}
              />
              <Detail
                label="Date of Packing / Mfg"
                value={fields.date_of_manufacture}
              />
              <Detail
                label="Consumer Care Details"
                value={fields.consumer_care}
              />
            </div>
          </div>

          {/* Compliance Checks */}
          <div className="mt-6 rounded-2xl border bg-white p-6">
            <h3 className="text-xl font-bold text-gray-900">
              Compliance Checks
            </h3>
            <div className="mt-5 space-y-3">
              {passedChecks.map((item, index) => (
                <div
                  key={`passed-${index}`}
                  className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4"
                >
                  <div>
                    <span className="font-medium text-gray-800">
                      {item.rule}
                    </span>
                    {item.value && (
                      <p className="mt-1 text-sm text-gray-500">
                        Value: {item.value}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    ✓ Passed
                  </span>
                </div>
              ))}

              {violationChecks.map((item, index) => (
                <div
                  key={`violation-${index}`}
                  className="flex items-start justify-between gap-4 rounded-xl border border-red-100 bg-red-50/40 p-4"
                >
                  <div>
                    <span className="font-medium text-gray-800">
                      {item.rule}
                    </span>
                    <p className="mt-1 text-sm text-red-600">
                      Declaration missing
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    ✕ Failed
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Violations / Warnings Banner */}
          {violationChecks.length > 0 && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
              <h3 className="text-xl font-bold text-red-800">
                ⚠ Violations / Missing Declarations ({violationChecks.length})
              </h3>
              <div className="mt-4 space-y-2">
                {violationChecks.map((violation, index) => (
                  <div
                    key={index}
                    className="rounded-lg bg-white p-4 font-medium text-red-700 shadow-sm"
                  >
                    • {violation.rule} is missing or could not be detected.
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button
              onClick={() => console.log("Scan Another Product clicked")}
              className="flex-1 rounded-xl bg-green-600 px-6 py-4 font-semibold text-white hover:bg-green-700"
            >
              Scan Another Product
            </button>

            <button
              onClick={() => {
                downloadPDF(result);
              }}
              className="flex-1 rounded-xl border border-gray-300 bg-white px-6 py-4 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Download PDF
            </button>
          </div>
        </main>
      </div>
    );
  }

  return null;
}
