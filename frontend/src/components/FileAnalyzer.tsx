import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const THEME = {
  primary: '#6d6cff',
  accent: '#0ea5e9',
  bgGlass: 'rgba(25,27,39,0.96)',
  hightlight: '#b6ccfa',
  boxShadow: '0 8px 32px #1e184063, 0 3.5px 11px #41379830',
};

const FileAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const navigate = useNavigate();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setError(null);
    setLoading(true);

    const data = new FormData();
    data.append('file', file);

    try {
      const res = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        body: data,
      });
      const response = await res.json();
      if (res.ok) {
        sessionStorage.setItem('cyberguard_result', JSON.stringify(response));
        navigate('/results');
      } else {
        setError(response.result || 'Analysis failed. Please try a different file.');
      }
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: "center",
      justifyContent: "center"
    }}>
      <form
        onSubmit={handleUpload}
        style={{
          width: "100%",
          maxWidth: 340,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <input
          type="file"
          accept="*/*"
          onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
          style={{
            marginBottom: file ? 10 : 18,
            color: "#a1a4af",
            padding: "8px 6px",
            borderRadius: 5,
            background: "rgba(7,14,40,0.19)",
            outline: "none",
            border: "1.2px solid #272a50",
            fontWeight: 500,
            fontSize: "1em",
            width: "100%",
            maxWidth: 280,
            boxSizing: "border-box"
          }}
          required
        />
        {file && (
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 11,
            justifyContent: 'center',
            fontSize: '0.99em',
            margin: "0 0 13px 0",
            color: '#bae6fd',
            maxWidth: '98%',
            width: "100%",
            overflow: "hidden"
          }}>
            <span style={{
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 160,
              display: "inline-block",
            }}>{file.name}</span>
            <span style={{
              color: "#abc",
              fontSize: ".98em",
              flexShrink: 0
            }}>
              ({Math.round(file.size / 1024)} KB)
            </span>
          </div>
        )}
        <button
          type="submit"
          disabled={!file || loading}
          style={{
            padding: "10px 28px 10px 20px",
            borderRadius: 7,
            background: `linear-gradient(96deg,${THEME.primary} 64%,${THEME.accent} 93%)`,
            color: "#fff",
            fontWeight: 700,
            fontSize: ".97em",
            border: "none",
            marginBottom: 0,
            marginTop: 0,
            boxShadow: "0 1px 8px #15135c48",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.68 : 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            justifyContent: "center",
            width: "100%",
            maxWidth: 201,
            marginLeft: "auto",
            marginRight: "auto"
          }}
        >
          {loading ? "Analyzing..." : (
            <>
              <span style={{ fontWeight: 500 }}>Analyze</span>
              <span style={{ fontSize: 18, marginLeft: 1 }}>🔍</span>
            </>
          )}
        </button>
        {error && (
          <div style={{
            margin: "13px auto 0 auto",
            color: "#fb7185",
            background: "#35132d",
            border: "1.1px solid #fb718522",
            borderRadius: 7,
            padding: "8px 12px",
            fontSize: "0.96em",
            maxWidth: 220,
            wordBreak: "break-word"
          }}>
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default FileAnalyzer;
