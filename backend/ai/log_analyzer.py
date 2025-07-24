# 📁 backend/ai/log_analyzer.py

import subprocess
import os
import json

def analyze_log_line(log_line):
    """
    Analyze a single log line using an LLM (via Ollama CLI).
    Returns standardized JSON response.
    """
    prompt = f"""
You are a cybersecurity expert. Analyze the following log entry and classify its risk level as 'low', 'medium', or 'high'. Then give a brief reason.

Log Entry:
{log_line}

Respond only in this JSON format:
{{
  "severity": "<low/medium/high>",
  "reason": "<text>"
}}
    """

    try:
        result = subprocess.run(
            ["ollama", "run", "llama3"],
            input=prompt,
            text=True,
            capture_output=True,
            encoding='utf-8',
            errors='replace'
        )

        return json.loads(result.stdout.strip())
    except Exception as e:
        return {
            "severity": "error",
            "reason": f"Error analyzing log: {str(e)}"
        }

def analyze_log_file(file_path, output_path):
    """
    Analyze all log entries in the file and save results to JSON file.
    """
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return

    print(f"📁 Reading log file: {file_path}\n")

    with open(file_path, 'r') as f:
        lines = f.readlines()

    results = []

    for line in lines:
        line = line.strip()
        if line:
            print(f"📄 Log: {line}")
            analysis = analyze_log_line(line)
            print(f"🧠 Analysis: {json.dumps(analysis, indent=2)}\n")

            results.append({
                "log": line,
                "analysis": analysis
            })

    # Save all results to a structured output file
    with open(output_path, 'w', encoding='utf-8') as out_file:
        json.dump(results, out_file, indent=2, ensure_ascii=False)

    print(f"✅ Analysis complete. Results saved to ▶ {output_path}")

if __name__ == "__main__":
    input_log_file = "sample.log"
    output_json_file = "log_analysis_output.json"
    analyze_log_file(input_log_file, output_json_file)
