import React, { useState } from "react";
import axios from "axios";

export default function Dashboard({ token }: { token: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);

  const uploadLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    let formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await axios.post("http://localhost:5000/api/logs/upload", formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` }
      });
      setResult(data);
    } catch (err: any) {
      alert(err.response?.data?.msg || "Upload error");
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="font-bold mb-2">Upload Security Log</h2>
      <form onSubmit={uploadLog}>
        <input type="file" accept=".txt,.log,.csv" onChange={e => setFile(e.target.files?.[0] || null)} className="mb-2" required />
        <button className="bg-green-600 text-white p-2 mb-4" type="submit">Analyze</button>
      </form>
      {result && (
        <div className="bg-gray-100 p-4 mt-4">
          <p>Total Lines: {result.totalLines}</p>
          <p>Errors: {result.errorCount}</p>
          <p>{result.message}</p>
        </div>
      )}
    </div>
  );
}
