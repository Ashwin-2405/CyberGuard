import React, { useState, useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const THEME = {
  primary: '#6d6cff',
  accent: '#0ea5e9',
  bgGlass: 'rgba(25,27,39,0.97)',
  hightlight: '#b6ccfa',
  trStripeA: '#222337E6',
  trStripeB: '#18192D',
  trHover: '#353670ef',
  boxShadow: '0 8px 32px #1e184063, 0 3.5px 11px #41379830',
  chartPieSafe:  '#22c55e',
  chartPieInfo:  '#60a5fa',
  chartPieWarn:  '#fde047',
  chartPieDang:  '#ef4444',
};

const LEVEL_COLORS: Record<string, string> = {
  SAFE:     THEME.chartPieSafe,
  INFO:     THEME.chartPieInfo,
  WARNING:  THEME.chartPieWarn,
  DANGEROUS:THEME.chartPieDang,
  DANGER:   THEME.chartPieDang
};
const SUMMARY_BG: Record<string, string> = {
  SAFE:     'rgba(34,197,94,0.12)',
  INFO:     'rgba(59,130,246,0.09)',
  WARNING:  'rgba(250,204,21,0.11)',
  DANGEROUS:'rgba(239,68,68,0.13)',
  DANGER:   'rgba(239,68,68,0.13)'
};
const THREAT_ICONS: Record<string, string> = {
  SAFE:     "🛡️",
  INFO:     "ℹ️",
  WARNING:  "⚠️",
  DANGEROUS:"🚨",
  DANGER:   "🚨"
};

function capitalize(txt: string) {
  return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
}

function csvEscape(s: string | undefined) {
  if (!s) return '';
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
function downloadCSV(data: any[], fileName: string) {
  if (!data?.length) return;
  const header = Object.keys(data[0]);
  const rows = data.map(row =>
    header.map(k => csvEscape((row as any)[k])).join(','));
  const blob = new Blob([
    header.join(',')+'\n'+rows.join('\n')
  ], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = fileName; document.body.appendChild(a);
  a.click(); setTimeout(()=>{document.body.removeChild(a)},100);
}

const FileAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [errors, setErrors] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [preview, setPreview] = useState<string[]|null>(null);
  const [loading, setLoading] = useState(false);
  const [tableSearch, setTableSearch] = useState('');

  const filteredErrors = useMemo(() =>
    !tableSearch
      ? errors
      : errors.filter(e =>
          (e.type || '').toLowerCase().includes(tableSearch.toLowerCase()) ||
          (e.message || '').toLowerCase().includes(tableSearch.toLowerCase()) ||
          (e.code || '').toLowerCase().includes(tableSearch.toLowerCase())
        ),
    [tableSearch, errors]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files ? e.target.files[0] : null);
    setResult(null); setSummary(null); setErrors([]); setChartData([]); setPreview(null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResult(null); setSummary(null); setErrors([]); setChartData([]); setPreview(null);

    const data = new FormData();
    data.append('file', file);

    try {
      const res = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        body: data,
      });
      const response = await res.json();

      setResult(response.result ?? 'Analysis completed.');
      setSummary(response.summary ?? null);
      setErrors(response.errors ?? []);
      setChartData(response.chartData ?? []);
      setPreview(response.preview ?? null);
    } catch (err) {
      setResult('File upload or analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const chartReady = useMemo(
    () => !!(chartData && chartData.length > 0 && chartData.some(v => v.count > 0)),
    [chartData]
  );

  // Clipboard copy with fallback
  const handleCopy = (text: string | undefined) => {
    if (text) {
      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
    }
  };

  return (
    <div style={{
      minWidth:320,
      background: THEME.bgGlass,
      borderRadius:28,
      boxShadow: THEME.boxShadow,
      color: "#f5f5fa",
      padding: "2.5em 1.2em 1.4em 1.2em",
      textAlign: "center",
      width: "100%",
      maxWidth:520,
      margin:"24px auto",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Inter', 'SF Pro Display', 'Roboto', Arial, sans-serif",
      backdropFilter: "blur(9px)",
      WebkitBackdropFilter: "blur(9px)",
      transition: "box-shadow 0.18s, background 0.24s"
    }} className="cyberguard-analyzer-card">

      {/* Soft wave background */}
      <svg
        viewBox="0 0 700 120"
        style={{
          position: "absolute",
          left: 0, top: -30,
          width: "100%",
          height: 90,
          zIndex: 0,
          opacity: 0.14,
          pointerEvents: "none"
        }}
        aria-hidden="true"
      >
        <path fill={THEME.accent} d="M0,80L100,60C200,40,400,80,700,60L700,0L0,0Z"/>
      </svg>

      <h2 style={{
        marginBottom: 18,
        fontWeight: 800,
        color: THEME.hightlight,
        fontSize: "1.45em",
        letterSpacing: "0.03em",
        textShadow: "0 1.5px 10px #000a"
      }}>
        Upload File for Deep Threat Analysis
      </h2>

      <form onSubmit={handleUpload} style={{marginBottom:16, zIndex:1, position: "relative"}}>
        <input
          type="file"
          accept="*/*"
          onChange={handleFileChange}
          style={{
            marginBottom:14,
            color: "#a1a4af",
            padding: "9px 6px",
            borderRadius: 4,
            background: "rgba(5,9,25,0.15)",
            outline: "none",
            border: "1.5px solid #272a50",
            fontWeight: 500,
            fontSize: "1em",
            maxWidth: 280,
          }}
        />
        {file && (
          <div style={{
            fontSize: "0.97em",
            marginBottom: 6,
            color: "#bae6fd",
            letterSpacing: "0.01em"
          }}>
            Selected: <b>{file.name}</b> 
            <span style={{color: "#888"}}>({Math.round(file.size/1024)} KB)</span>
          </div>
        )}
        <div style={{marginTop:4, marginBottom:4}}>
          <button
            type="submit"
            disabled={!file || loading}
            style={{
              padding: "10px 28px",
              borderRadius: 6,
              background: `linear-gradient(96deg,${THEME.primary} 44%,${THEME.accent})`,
              color: "#fff",
              fontWeight: 700,
              fontSize: "1em",
              border: "none",
              marginTop: 4,
              marginBottom: 3,
              boxShadow: "0 1px 12px #15135c52",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.17s"
            }}
          >
            {loading ? "Analyzing..." : <><span style={{fontWeight:500}}>Analyze</span> <span style={{fontSize:18}}>🔍</span></>}
          </button>
        </div>
      </form>

      {result && (
        <div style={{
          margin: "24px auto 8px auto",
          borderRadius: 12,
          background: summary ? (SUMMARY_BG[summary.safetyLevel || 'SAFE']) : 'rgba(31,41,55,0.12)',
          border: `1.5px solid ${(summary ? LEVEL_COLORS[summary.safetyLevel] : "#2dd4bf")}`,
          fontWeight: 500,
          fontSize: "1.07em",
          padding: "15px 12px 15px 14px",
          lineHeight: 1.52,
          maxWidth: 420,
          boxShadow: "0 3px 24px #3b82f612, 0 1.5px 7px #70c0ff22",
          display: "flex",
          alignItems: "flex-start",
          gap: 13,
          animation: "fade-in .6s cubic-bezier(.15,.85,.34,1.14)",
        }}>
          {summary
            ? <>
              <span style={{
                fontWeight:850,
                fontSize:"1.3em",
                color: LEVEL_COLORS[summary.safetyLevel],
                marginRight: 3
              }}>
                {THREAT_ICONS[summary.safetyLevel]} {summary.safetyLevel?.toUpperCase()}
              </span>
              <span style={{marginLeft:2}}/>
              <span style={{textAlign:"left"}}>
                {summary.totalIssues === 0
                  ? "No threats or errors detected."
                  : <span>
                      <b>{summary.totalIssues}</b> security issue{summary.totalIssues!==1?'s':''} found.
                    </span>
                }
                <br />
                <span style={{
                  fontWeight: 400,
                  color: "#62bbfa",
                  fontSize: '0.98em',
                  letterSpacing: ".01em"
                }}>
                  <b>{summary.fileName}</b> ({summary.fileType})
                </span>
              </span>
            </>
            : <span>{result}</span>}
        </div>
      )}

      {summary?.threatScore !== undefined && (
        <div style={{
          marginBottom: 14,
          fontWeight: 510,
          color: LEVEL_COLORS[summary.safetyLevel],
          fontSize: ".94em",
          letterSpacing: "0.01em"
        }}>
          <span style={{color:"#c7f8c7", marginRight:3}}>Threat Score:</span>
          <span style={{
            color: LEVEL_COLORS[summary.safetyLevel],
            fontWeight:700,
            fontSize: "1.08em"
          }}>{summary.threatScore}/10</span>
        </div>
      )}

      {/* Pie Chart Section */}
      {chartReady && (
        <div style={{
          margin: "0 auto 18px auto", width: "99%",
          background: "rgba(28,30,50,0.75)",
          borderRadius: 15,
          boxShadow: "0 2px 18px #18182926, 0 1px 10px #2c2b3b16",
          padding: "12px 0 0 0",
        }}>
          <div style={{
            color: "#c7d8fe", fontWeight:500, marginBottom: "2px",
            fontSize:"1.06em"
          }}>
            Distribution of Issues
            <span style={{
              fontSize: ".92em", color: "#d1d5db", marginLeft:6, cursor:"help"
            }} title="Counts of each severity detected in this file."> ⓘ</span>
          </div>
          <ResponsiveContainer minHeight={190} height={210}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="type"
                cx="50%" cy="50%" outerRadius={72}
                label={({type, count})=>
                  (count>0 ? `${capitalize(type)} (${count})`: null)}
                isAnimationActive={true}
                animationDuration={700}
              >
                {chartData.map((entry:any, idx:number) => (
                  <Cell key={`cell-${idx}`}
                    fill={LEVEL_COLORS[entry.type] ?? "#ddd"}
                    stroke="#23234f"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#252653",
                  border: "1.5px solid #2d1f6e",
                  borderRadius: 9,
                  color: "#c5defa",
                  fontSize: "1em"
                }}
              />
              <Legend layout="horizontal" align="center" verticalAlign="bottom"
                iconType="circle" wrapperStyle={{fontSize:"0.97em", color:"#c3cfff"}}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Threat/Error Table with controls */}
      {errors && errors.length > 0 && (
        <div>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "13px 0 0 0",
            gap: 10,
          }}>
            <input
              type="text"
              value={tableSearch}
              onChange={e => setTableSearch(e.target.value)}
              placeholder="Search issues or code…"
              style={{
                padding: "7px 11px", borderRadius: 7, outline: "none", background: "rgba(17,22,36,0.91)",
                color: "#eff6ff", minWidth: 0, fontWeight: 500, border: "1.5px solid #2e364d",
                marginRight: 6, fontSize: ".97em",
              }}
            />
            <button
              onClick={() =>
                downloadCSV(filteredErrors, summary?.fileName?.replace(/\s/g,"_") + "_cyberguard_results.csv")
              }
              style={{
                background: THEME.primary, color: "#fff", border: "none", padding: "8.3px 18px",
                borderRadius: 6, fontWeight: 580, fontSize: ".99em", cursor: "pointer",
                boxShadow: "0 1px 10px #64669c2b", letterSpacing: ".02em"
              }}
              title="Download issue list as CSV"
              tabIndex={0}
              aria-label="Download CSV"
            >⬇️ CSV</button>
          </div>
          <div style={{
            borderRadius: 13, background: "#181829ee", border: "1px solid #23234f",
            margin: "12px 0 0 0", maxHeight: 230, overflowY: "auto",
            boxShadow: '0 4px 14px #0ea5e923',
          }}>
            <table style={{
              width: "100%", margin: 0, fontSize: ".97em", color: "#e2e8f0", borderCollapse: "collapse",
              fontFamily: "'JetBrains Mono','Menlo',monospace,system-ui"
            }}>
              <thead style={{
                background: "#2a2f4f",
                position: "sticky",
                top: 0,
                zIndex: 5,
              }}>
                <tr>
                  <th style={{padding:"7px 5px", fontWeight:700, letterSpacing: "0.01em", whiteSpace:"nowrap", background:"#23234f", borderBottom:"1px solid #383c60"}}>Line</th>
                  <th style={{padding:"7px 5px", fontWeight:700, letterSpacing: "0.01em", whiteSpace:"nowrap", background:"#23234f", borderBottom:"1px solid #383c60"}}>Level <span style={{fontSize:".98em"}} title="Severity">ⓘ</span></th>
                  <th style={{padding:"7px 5px", fontWeight:700, letterSpacing: "0.01em", whiteSpace:"nowrap", background:"#23234f", borderBottom:"1px solid #383c60"}}>Finding</th>
                  <th style={{padding:"7px 5px", fontWeight:700, letterSpacing: "0.01em", whiteSpace:"nowrap", background:"#23234f", borderBottom:"1px solid #383c60"}}>Code/Text</th>
                  <th style={{padding:"7px 5px", fontWeight:700, letterSpacing: "0.01em", whiteSpace:"nowrap", background:"#23234f", borderBottom:"1px solid #383c60"}}><span title="Copy code/text">📋</span></th>
                </tr>
              </thead>
              <tbody>
                {filteredErrors.map((err, i) =>
                  <tr
                    key={i}
                    tabIndex={0}
                    style={{
                      background: (i % 2 === 0) ? THEME.trStripeA : THEME.trStripeB,
                      color: LEVEL_COLORS[err.type] ?? "#fff",
                      transition: 'background 0.17s',
                      cursor: "pointer"
                    }}
                    onMouseOver={e => ((e.currentTarget as HTMLElement).style.background = THEME.trHover)}
                    onMouseOut={e => ((e.currentTarget as HTMLElement).style.background = (i%2 === 0) ? THEME.trStripeA : THEME.trStripeB)}
                  >
                    <td style={{padding:"6px 2px", fontWeight:500}}>{err.line}</td>
                    <td style={{
                        fontWeight:800,
                        color: LEVEL_COLORS[err.type] ?? "#fff",
                        fontSize: ".99em"
                      }}
                    >{capitalize(err.type)}</td>
                    <td>{err.message}</td>
                    <td
                      style={{
                        fontFamily:"'JetBrains Mono','Menlo',monospace",
                        fontSize:"0.96em",
                        maxWidth:120,
                        overflow:"hidden",
                        textOverflow:"ellipsis",
                        whiteSpace:"nowrap"
                      }}
                      title={err.code}
                    >{err.code || '-'}</td>
                    <td>
                      <button
                        style={{
                          background: "none", border:"none", cursor:"pointer",
                          color: "#6d9dff",
                          fontWeight: 550, fontSize:"1.12em", padding: "1.5px 7px",
                          outline:"none"
                        }}
                        tabIndex={0}
                        aria-label="Copy to clipboard"
                        title="Copy code/text"
                        onClick={() => handleCopy(err.code)}
                      >📋</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{
            display: "flex", alignItems: "center", color: "#8ba6e5",
            fontSize: ".95em", marginTop: 3, justifyContent: "flex-end"
          }}>
            Showing {filteredErrors.length} row{filteredErrors.length !== 1 ? 's' : ''}
            {tableSearch && <span> (filtered) </span>}
          </div>
        </div>
      )}

      {!loading && errors && errors.length === 0 && result && summary && (
        <div style={{
          marginTop:12,
          fontSize:"1.09em",
          color:"#3afba9",
          fontWeight:600,
          letterSpacing:".01em"
        }}>
          No threats or errors found in this file. 🎉
        </div>
      )}

      {preview && preview.length > 0 && (
        <div style={{
          marginTop: 18,
          fontSize: "0.97em",
          background: "rgba(41,46,70,0.69)",
          borderRadius: 10,
          boxShadow: "0 1px 9px #0ea5e922",
          padding: "7px 11px"
        }}>
          <div style={{
            color: "#c8bfff",
            marginBottom: 1,
            fontWeight: 600
          }}>File snippet:</div>
          <pre style={{
            background: "none",
            color: "#bae6fd",
            textAlign: "left",
            borderRadius: 6,
            fontSize: "1.01em",
            padding:"4px 6px",
            overflowX:"auto",
            margin:"4px 0"
          }}>{preview.map((l,i)=>`${i+1}: ${l}`).join('\n')}</pre>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(18px);}
          to { opacity:1; transform: translateY(0);}
        }
        .cyberguard-analyzer-card *::selection { background: #353fa8be;}
        ::-webkit-scrollbar-thumb {
          background: #393b5c88; border-radius: 8px
        }
        ::-webkit-scrollbar { background: #23234f22; height:7px; width:7px }
      `}</style>
      <div style={{height:10}} />
    </div>
  );
};

export default FileAnalyzer;
