import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  PieLabelRenderProps,
} from 'recharts';

interface ThreatError {
  line: number;
  type: string;
  message: string;
  code: string;
}
interface ChartDataEntry {
  type: string;
  count: number;
}

const THEME = {
  primary: '#6d6cff',
  accent: '#0ea5e9',
  bgGlass: 'rgba(25,27,39,0.98)',
  hightlight: '#b6ccfa',
  trStripeA: '#222337fa',
  trStripeB: '#191b2dea',
  trHover: '#363a56cc',
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
  SAFE:     'rgba(34,197,94,0.14)',
  INFO:     'rgba(59,130,246,0.11)',
  WARNING:  'rgba(250,204,21,0.13)',
  DANGEROUS:'rgba(239,68,68,0.16)',
  DANGER:   'rgba(239,68,68,0.16)'
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

const ResultPage: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [tableSearch, setTableSearch] = useState<string>('');
  const navigate = useNavigate();

  // Memo for errors/chartData to avoid react-hooks/exhaustive-deps warnings:
  const errors: ThreatError[] = useMemo(
    () => result?.errors ?? [],
    [result]
  );
  const chartData: ChartDataEntry[] = useMemo(
    () => result?.chartData ?? [],
    [result]
  );
  const summary = result?.summary ?? null;
  const preview: string[] = result?.preview ?? null;

  const filteredErrors = useMemo(
    () =>
      !tableSearch
        ? errors
        : errors.filter(
            (e: ThreatError) =>
              (e.type || '').toLowerCase().includes(tableSearch.toLowerCase()) ||
              (e.message || '').toLowerCase().includes(tableSearch.toLowerCase()) ||
              (e.code || '').toLowerCase().includes(tableSearch.toLowerCase())
          ),
    [tableSearch, errors]
  );
  const chartReady = useMemo(
    () => Boolean(chartData.length > 0 && chartData.some((v: ChartDataEntry) => v.count > 0)),
    [chartData]
  );

  useEffect(() => {
    const data = window.sessionStorage.getItem('cyberguard_result');
    try {
      if (!data) setNotFound(true);
      else setResult(JSON.parse(data));
    } catch {
      setNotFound(true);
    }
  }, []);

  const handleCopy = (text: string | undefined) => {
    if (!text) return;
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
  };

  // ---- Compact card, no scroll, modal style ----
  if (notFound)
    return (
      <div style={{
        height: '100vh', minHeight: '100dvh',
        width: '100vw', background: "linear-gradient(111deg, #23234c 70%, #513afe 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          boxShadow: THEME.chartPieInfo + '40 0px 8px 28px',
          background: THEME.bgGlass,
          borderRadius: 20,
          padding: "40px 25px 36px 25px",
          display: "flex", flexDirection: "column", alignItems:"center"
        }}>
          <h2 style={{marginBottom:5, fontWeight:800, fontSize:"2em", color: THEME.hightlight}}>No result!</h2>
          <div style={{fontSize:"1.05em", color:"#bcd0fa", opacity:0.96, marginBottom:18}}>
            Please <span style={{color:THEME.accent}}>upload a file</span> first.
          </div>
          <button
            onClick={() => navigate('/')}
            style={{
              padding:"11px 32px",
              background: `linear-gradient(90deg,${THEME.primary},${THEME.accent})`,
              border: "none",
              borderRadius: 8,
              color: "#fff",
              fontSize: "1em",
              fontWeight: 700,
              letterSpacing:".01em",
              cursor:"pointer"
            }}
          >Go to upload</button>
        </div>
      </div>
    );

  return (
    <div
      style={{
        height: '100vh',
        minHeight: '100dvh',
        width: '100vw',
        background: 'linear-gradient(111deg, #23234c 70%, #513afe 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          maxWidth: 570,
          width: "98vw",
          maxHeight: 720,
          minHeight: 0,
          borderRadius: 20,
          background: THEME.bgGlass,
          boxShadow: "0 6px 36px #23234c40, 0 2.5px 36px #6366f126",
          padding: "22px 0 18px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start"
        }}
      >
        {/* Brand & BACK */}
        <div style={{
          width:"100%", minWidth:0, display:"flex", alignItems:"center",
          justifyContent:"space-between", maxWidth:520, margin:"0 auto 8px auto", padding: "0 18px"
        }}>
          <span style={{fontWeight:800, fontSize:26, color:"#b3cefa"}}>Result</span>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "none",
              border: "none",
              color: THEME.primary,
              fontWeight: 550,
              fontSize: "1.03em",
              padding: "4.5px 13px",
              borderRadius: 9,
              cursor:"pointer",
              boxShadow: "0 1.5px 9px #6366f122",
              opacity: 0.87
            }}
          >⏎ Back</button>
        </div>
        {/* Summary Card */}
        <div style={{
          width: '95%', maxWidth: 490, margin:0, marginBottom: 11,
          borderRadius: 14,
          background: summary ? (SUMMARY_BG[summary.safetyLevel || 'SAFE']) : 'rgba(31,41,55,0.13)',
          border: `1.5px solid ${(summary ? LEVEL_COLORS[summary.safetyLevel] : "#2dd4bf")}`,
          fontWeight: 500,
          fontSize: "0.99em",
          padding: "11px 14px 10px 14px",
          lineHeight: 1.28,
          display:"flex",
          alignItems:"flex-start",
          gap: 11,
          boxShadow: "0 2.5px 9px #70c0ff19"
        }}>
          {summary
            ? <>
                <span style={{
                  fontWeight:800,
                  fontSize:"1.25em",
                  color: LEVEL_COLORS[summary.safetyLevel],
                  marginRight: 2
                }}>
                  {THREAT_ICONS[summary.safetyLevel]} {summary.safetyLevel?.toUpperCase()}
                </span>
                <span>
                  <span style={{textAlign:"left", fontSize:"1.05em"}}>
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
                    <br/>
                    <span style={{
                      fontWeight: 400,
                      color: LEVEL_COLORS[summary.safetyLevel],
                      fontSize: '1.05em'
                    }}>
                      Score: <b>{summary.threatScore}/10</b>
                    </span>
                  </span>
                </span>
              </>
            : <span>Analysis summary unavailable.</span>}
        </div>
        {/* Pie Chart */}
        {chartReady && (
          <div style={{
            margin: "0 0 13px 0", width: "92%",
            background: "rgba(28,30,50,0.81)",
            borderRadius: 13,
            boxShadow: "0 2px 12px #18182924",
            padding: "8px 0 0 0",
            maxWidth: 380,
            minWidth: 0,
          }}>
            <div style={{
              color: "#c7d8fe", fontWeight:500, marginBottom: "2px",
              fontSize:"1.04em", paddingLeft:12
            }}>
              Distribution of Issues
              <span style={{
                fontSize: ".91em", color: "#d1d5db", marginLeft:6, cursor:"help"
              }} title="Counts of each severity detected in this file."> ⓘ</span>
            </div>
            <ResponsiveContainer minHeight={140} height={148}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="type"
                  cx="50%" cy="50%" outerRadius={53}
                  label={(props: PieLabelRenderProps) => {
                    const t = (props.name ?? (props.payload && (props.payload as any).type)) as string;
                    const c = (props.value ?? (props.payload && (props.payload as any).count)) as number;
                    return c > 0 ? `${capitalize(t)} (${c})` : null;
                  }}
                  isAnimationActive={true}
                  animationDuration={690}
                >
                  {chartData.map((entry: ChartDataEntry, idx: number) => (
                    <Cell key={`cell-${idx}`}
                      fill={LEVEL_COLORS[entry.type] ?? "#ddd"}
                      stroke="#23234f"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#252653",
                    border: "1.2px solid #2d1f6e",
                    borderRadius: 9,
                    color: "#c5defa",
                    fontSize: "0.97em"
                  }}
                />
                <Legend layout="horizontal" align="center" verticalAlign="bottom"
                  iconType="circle" wrapperStyle={{fontSize:"0.96em", color:"#c3cfff"}}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        {/* Threat/Error Table with scroll only if needed */}
        {errors && errors.length > 0 && (
          <div style={{
            width:"95%", maxWidth:490, margin:"0 auto",
            flex: "1 1 0", display:"flex", flexDirection:"column"
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              margin: "12px 0 0 0", gap: 7, flexWrap:"wrap"
            }}>
              <input
                type="text"
                value={tableSearch}
                onChange={e => setTableSearch(e.target.value)}
                placeholder="Search issues or code…"
                style={{
                  padding: "6px 11px", borderRadius: 7, outline: "none", background: "rgba(17,22,36,0.91)",
                  color: "#eff6ff", minWidth:0, fontWeight: 500, border: "1.5px solid #2e364d",
                  marginRight: 6, fontSize: ".95em", flex:1, maxWidth:190
                }}
              />
              <button
                onClick={() =>
                  downloadCSV(filteredErrors, summary?.fileName?.replace(/\s/g,"_") + "_cyberguard_results.csv")
                }
                style={{
                  background: THEME.primary, color: "#fff", border: "none", padding: "7.5px 14px",
                  borderRadius: 6, fontWeight: 560, fontSize: ".96em", cursor: "pointer",
                  boxShadow: "0 1px 6px #64669c22", letterSpacing: ".01em"
                }}
                title="Download issue list as CSV"
                tabIndex={0}
                aria-label="Download CSV"
              >⬇️ CSV</button>
            </div>
            <div style={{
              borderRadius: 10, background: "#181829f4", border: "1px solid #23234f",
              margin: "9px 0 0 0", maxHeight:135, overflowY:"auto",
              boxShadow: '0 3px 12px #0ea5e91b',
              width:"100%",
            }}>
              <table style={{
                width: "100%", margin: 0, fontSize: ".95em", color: "#e2e8f0", borderCollapse: "collapse",
                fontFamily: "'JetBrains Mono','Menlo',monospace,system-ui"
              }}>
                <thead style={{
                  background: "#2a2f4f",
                  position: "sticky", top: 0, zIndex: 5,
                }}>
                  <tr>
                    <th style={{padding:"5.5px 4px", fontWeight:700, background:"#23234f"}}>Line</th>
                    <th style={{padding:"5.5px 4px", fontWeight:700, background:"#23234f"}}>Level</th>
                    <th style={{padding:"5.5px 4px", fontWeight:700, background:"#23234f"}}>Finding</th>
                    <th style={{padding:"5.5px 4px", fontWeight:700, background:"#23234f"}}>Code/Text</th>
                    <th style={{padding:"5.5px 4px", fontWeight:700, background:"#23234f"}}><span title="Copy code/text">📋</span></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredErrors.map((err: ThreatError, i: number) =>
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
                      <td style={{padding:"4px 2px", fontWeight:500}}>{err.line}</td>
                      <td style={{
                          fontWeight:800,
                          color: LEVEL_COLORS[err.type] ?? "#fff",
                          fontSize: ".96em"
                        }}
                      >{capitalize(err.type)}</td>
                      <td>{err.message}</td>
                      <td
                        style={{
                          fontFamily:"'JetBrains Mono','Menlo',monospace",
                          fontSize:"0.93em",
                          maxWidth:70,
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
                            fontWeight: 535, fontSize:"1.08em", padding: "1px 7px",
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
        {!errors.length && (
          <div style={{
            marginTop: 6, fontSize:"1.03em", color:"#2dd4bf", fontWeight:600
          }}>No threats or errors found in this file. 🎉</div>
        )}
        {preview && preview.length > 0 && (
          <div style={{
            marginTop: 11,
            fontSize: "0.95em",
            background: "rgba(41,46,70,0.62)",
            borderRadius: 10,
            boxShadow: "0 1px 9px #0ea5e917",
            padding: "7px 11px",
            maxWidth: 430,
            width: "93%",
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
              fontSize: "0.98em",
              padding:"3px 5px",
              overflowX:"auto",
              margin:"4px 0"
            }}>
              {preview.map((l: string, i: number) => `${i+1}: ${l}`).join('\n')}
            </pre>
          </div>
        )}
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(18px);}
            to { opacity:1; transform: translateY(0);}
          }
          html, body, #root {
            height: 100vh !important;
            overflow: hidden !important;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ResultPage;
