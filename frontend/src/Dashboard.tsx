import React, { useState, FormEvent } from "react";
import axios from "axios";
import Button from "./Button";
import Alert from "./Alert";
import Loader from "./Loader";
import EmptyState from "./EmptyState";
import LogChart from "./LogChart";

interface DashboardProps {
  token: string;
  onLogout?: () => void; // Not used, but kept for type compatibility
}

interface LogResult {
  totalLines: number;
  errorCount: number;
  warningCount?: number;
  infoCount?: number;
  message: string;
  aiSummary?: string;
  [key: string]: any;
}

const Dashboard: React.FC<DashboardProps> = ({ token }) => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<LogResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadLog = async (e: FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setResult(null);
    if (!file) {
      setUploadError("Please select a log file before uploading.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/logs/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setResult(data);
    } catch (err: any) {
      setUploadError(
        err.response?.data?.msg ||
          (err.message?.includes("Network") ? "Network error: could not connect to backend." : "Upload error")
      );
    } finally {
      setLoading(false);
    }
  };

  // On token change/reset, clear UI state
  React.useEffect(() => {
    setFile(null);
    setResult(null);
    setUploadError(null);
    setLoading(false);
  }, [token]);

  return (
    <main className="flex flex-col items-center justify-center px-2 min-h-[90vh] w-full">
      {/* Header, compact and single-line */}
      <div className="w-full max-w-xl flex flex-col items-center justify-center mb-2 mt-4">
        <h1
          className="text-2xl sm:text-2xl font-bold whitespace-nowrap overflow-hidden text-ellipsis w-full text-center"
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: 1.24,
            fontWeight: 900,
            letterSpacing: "0.01em",
          }}
        >
          CyberGuard Security Log Analyzer
        </h1>
        <p className="text-sky-800 text-xs font-medium pt-0.5 pb-2 mb-0 text-center max-w-[280px] sm:max-w-full truncate">
          Quickly detect security issues in your log files, powered by AI.
        </p>
      </div>

      {/* Card */}
      <section className="card glass fade-in-up mx-auto w-full max-w-sm p-5 mt-0"
        style={{ marginTop: 0, marginBottom: 0, minHeight: "340px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <form onSubmit={uploadLog} className="flex flex-col items-center" noValidate>
          <label htmlFor="log-upload" className="font-semibold text-base mb-1 mt-1 text-center">Upload Security Log</label>
          <input
            id="log-upload"
            type="file"
            accept=".txt,.log,.csv"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="mb-1 mt-0 w-full text-sm"
            disabled={loading}
            required
          />
          {file && (
            <span className="text-muted text-xs mb-1 text-center w-full truncate">
              Selected: <span className="font-semibold text-zinc-800">{file.name}</span>
            </span>
          )}
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading || !file}
            loading={loading}
            className="w-full mt-1 mb-2 bg-blue-600 hover:bg-blue-700 text-white"
            style={{ maxWidth: 220 }}
          >
            Analyze
          </Button>
        </form>

        {loading && <Loader text="Analyzing..." className="my-2" />}

        {uploadError && (
          <Alert type="error" role="alert" className="fade-in-up mt-2">
            {uploadError}
          </Alert>
        )}

        {!result && !loading && !uploadError && (
          <EmptyState
            title="No log analyzed"
            message="Upload a log file to instantly get security insights."
          />
        )}

        {result && (
          <>
            <Alert type="success" role="status" className="fade-in-up mb-1 mt-2">
              {result.message || "Log analyzed successfully!"}
            </Alert>
            <div className="data-summary fade-in-up mt-2 mb-2" aria-live="polite">
              <div>
                <span className="font-bold text-zinc-800 mr-1">Total Lines:</span>
                <span>{result.totalLines}</span>
              </div>
              <div>
                <span className="font-bold text-zinc-800 mr-1">Errors Detected:</span>
                <span className={result.errorCount > 0 ? "text-red-600 font-bold" : "text-green-600"}>
                  {result.errorCount}
                </span>
              </div>
              {typeof result.warningCount !== "undefined" && (
                <div>
                  <span className="font-bold text-yellow-600 mr-1">Warnings:</span>
                  <span>{result.warningCount}</span>
                </div>
              )}
              {typeof result.infoCount !== "undefined" && (
                <div>
                  <span className="font-bold text-blue-500 mr-1">Info:</span>
                  <span>{result.infoCount}</span>
                </div>
              )}
              {result.aiSummary && (
                <div>
                  <span className="font-bold text-cyan-700 mr-1">AI Summary:</span>
                  <span>{result.aiSummary}</span>
                </div>
              )}
            </div>
            <div className="mt-3" aria-label="Log analysis chart">
              <LogChart
                errorCount={result.errorCount}
                warningCount={result.warningCount}
                infoCount={result.infoCount}
              />
            </div>
          </>
        )}
      </section>
    </main>
  );
};

export default Dashboard;
