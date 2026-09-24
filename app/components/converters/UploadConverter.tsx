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

export type PasswordFieldConfig = {
  /** FormData 필드명 (예: "naverPassword") */
  name: string;
  label: string;
  /** 성공한 비밀번호를 기억해둘 localStorage 키 */
  storageKey: string;
};

export type ConverterResponse = {
  success: boolean;
  error?: string;
  /** 비밀번호가 틀려서 실패한 경우 true (파일 매칭 실패와 구분용) */
  passwordError?: boolean;
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
  passwordField,
}: {
  title: string;
  endpoint: string;
  accentColor: string;
  fields: [FileFieldConfig, FileFieldConfig];
  stageLabels: StageLabel[];
  downloadLabel?: string;
  passwordField?: PasswordFieldConfig;
}) {
  const [files, setFiles] = useState<Record<string, File | null>>({
    [fields[0].name]: null,
    [fields[1].name]: null,
  });
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [result, setResult] = useState<ConverterResponse | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (!passwordField) return;
    const saved = window.localStorage.getItem(passwordField.storageKey);
    if (saved) {
      setPassword(saved);
      setShowPasswordField(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bothSelected = fields.every((f) => files[f.name]);
  const anySelected = fields.some((f) => files[f.name]);

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
      if (passwordField && password) {
        formData.append(passwordField.name, password);
      }

      try {
        const res = await fetch(endpoint, { method: "POST", body: formData });
        const data: ConverterResponse = await res.json();
        setResult(data);

        if (data.passwordError) {
          setShowPasswordField(true);
        }

        if (data.success && data.fileBase64 && data.mimeType) {
          if (passwordField && password) {
            window.localStorage.setItem(passwordField.storageKey, password);
          }

          const blob = base64ToBlob(data.fileBase64, data.mimeType);
          const url = URL.createObjectURL(blob);
          setDownloadUrl(url);

          const a = document.createElement("a");
          a.href = url;
          a.download = data.filename ?? "download";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
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
    setResetKey((k) => k + 1);
  };

  const retry = () => {
    setStatus("idle");
    setResult(null);
  };

  return (
    <div className="cs-tool" style={{ ["--accent" as string]: accentColor }}>
      <div className="cs-tool__head">
        <h2>{title}</h2>
        {anySelected && (
          <button type="button" className="cs-reset-btn" onClick={reset} disabled={status === "loading"}>
            ↺ 초기화
          </button>
        )}
      </div>

      <div className="cs-upload-row">
        {fields.map((field) => (
          <div className="cs-field" key={field.name}>
            <label htmlFor={field.name}>{field.label}</label>
            <label
              className="cs-dropzone"
              htmlFor={field.name}
              style={{ ["--accent" as string]: accentColor }}
            >
              <span className="cs-dropzone__button">파일 선택</span>
              <span className="cs-dropzone__filename">
                {files[field.name]?.name ?? "선택된 파일 없음"}
              </span>
              <input
                key={resetKey}
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
            </label>
            {field.hint && <p className="cs-field__hint">{field.hint}</p>}
          </div>
        ))}

        <div className="cs-hint-text">두 파일을 모두 올리면 자동으로 처리가 시작됩니다.</div>

        <div className="cs-download-wrap">
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

      {passwordField && showPasswordField && (
        <div className="cs-password-field">
          <label htmlFor={passwordField.name}>{passwordField.label}</label>
          <input
            id={passwordField.name}
            type="text"
            inputMode="numeric"
            value={password}
            disabled={status === "loading"}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="예: 1234"
          />
          <p className="cs-field__hint">
            한 번 성공하면 이 브라우저에 기억해둬서 다음부터는 다시 입력하지 않아도 됩니다.
          </p>
        </div>
      )}

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
                  onClick={result.passwordError ? retry : reset}
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
