"use client";

import { useEffect, useState } from "react";

export type FileFieldConfig = {
  name: string;
  label: string;
  hint?: string;
};

export type StageLabel = {
  key: string;
  label: string;
};

export type ConverterResponse = {
  success: boolean;
  error?: string;
  stats?: Record<string, number>;
  unmatched?: string[];
  filename?: string;
  mimeType?: string;
  fileBase64?: string;
};

function base64ToBlob(base64: string, mime: string): Blob {
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  return new Blob([new Uint8Array(byteNumbers)], { type: mime });
}

export default function UploadConverter({
  title,
  endpoint,
  accentColor,
  fields,
  stageLabels,
  downloadLabel = "결과 다운로드",
}: {
  title: string;
  endpoint: string;
  accentColor: string;
  fields: [FileFieldConfig, FileFieldConfig];
  stageLabels: StageLabel[];
  downloadLabel?: string;
}) {
  const [files, setFiles] = useState<Record<string, File | null>>({
    [fields[0].name]: null,
    [fields[1].name]: null,
  });
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [result, setResult] = useState<ConverterResponse | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const bothSelected = fields.every((f) => files[f.name]);

  useEffect(() => {
    if (!bothSelected || status !== "idle") return;

    const run = async () => {
      setStatus("loading");
      setResult(null);

      const formData = new FormData();
      fields.forEach((f) => {
        const file = files[f.name];
        if (file) formData.append(f.name, file);
      });

      try {
        const res = await fetch(endpoint, { method: "POST", body: formData });
        const data: ConverterResponse = await res.json();
        setResult(data);

        if (data.success && data.fileBase64 && data.mimeType) {
          const blob = base64ToBlob(data.fileBase64, data.mimeType);
          setDownloadUrl(URL.createObjectURL(blob));
        }
      } catch {
        setResult({ success: false, error: "네트워크 오류로 처리에 실패했습니다. 다시 시도해주세요." });
      } finally {
        setStatus("done");
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bothSelected, status]);

  const reset = () => {
    setFiles({ [fields[0].name]: null, [fields[1].name]: null });
    setStatus("idle");
    setResult(null);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
  };

  return (
    <div className="cs-tool" style={{ ["--accent" as string]: accentColor }}>
      <h2>{title}</h2>

      <div className="cs-upload-row">
        {fields.map((field) => (
          <div className="cs-field" key={field.name}>
            <label htmlFor={field.name}>{field.label}</label>
            <div className="cs-dropzone" style={{ ["--accent" as string]: accentColor }}>
              <span className="cs-dropzone__button">파일 선택</span>
              <span className="cs-dropzone__filename">
                {files[field.name]?.name ?? "선택된 파일 없음"}
              </span>
              <input
                id={field.name}
                type="file"
                accept=".xlsx,.xls"
                disabled={status === "loading"}
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
                  setDownloadUrl(null);
                  setResult(null);
                  setStatus("idle");
                  setFiles((prev) => ({ ...prev, [field.name]: file }));
                }}
              />
            </div>
            {field.hint && <p className="cs-field__hint">{field.hint}</p>}
          </div>
        ))}

        <div className="cs-hint-text">두 파일을 모두 올리면 자동으로 처리가 시작됩니다.</div>

        <div>
          {result?.success && downloadUrl && result.filename && (
            <a
              className="cs-download-btn"
              style={{ ["--accent" as string]: accentColor }}
              href={downloadUrl}
              download={result.filename}
            >
              {downloadLabel}
            </a>
          )}
        </div>
      </div>

      {status === "loading" && (
        <div className="cs-status cs-status--progress">처리 중입니다...</div>
      )}

      {result && (
        <>
          {result.stats && (
            <div className={`cs-status ${result.success ? "cs-status--success" : "cs-status--progress"}`}>
              {stageLabels
                .map((s) => `${s.label} ${result.stats?.[s.key] ?? 0}건`)
                .concat(`미매칭 ${result.stats?.unmatched ?? 0}건`)
                .join(" / ")}
            </div>
          )}

          {result.success ? (
            <div className="cs-status cs-status--success">
              ✅ 총 {result.stats?.total ?? 0}건 전부 매칭 완료! 위 버튼으로 결과 파일을 받으세요.
            </div>
          ) : (
            <div className="cs-status cs-status--error">
              ⚠ {result.error}
              {result.unmatched && result.unmatched.length > 0 && (
                <ul className="cs-unmatched-list">
                  {result.unmatched.map((id) => (
                    <li key={id}>{id}</li>
                  ))}
                </ul>
              )}
              <div>
                <button
                  type="button"
                  onClick={reset}
                  style={{ marginTop: "0.75rem", cursor: "pointer" }}
                >
                  다시 시도
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <p className="cs-tool-footnote">
        업로드한 파일은 서버에 저장되지 않고, 처리 후 즉시 메모리에서 사라집니다.
      </p>
    </div>
  );
}
