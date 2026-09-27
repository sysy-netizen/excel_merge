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
  downloadLabel = "다운로드 실행",
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
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [dropError, setDropError] = useState<string | null>(null);

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

  const selectFile = (fieldName: string, file: File | null) => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setResult(null);
    setStatus("idle");
    setDropError(null);
    setFiles((prev) => ({ ...prev, [fieldName]: file }));
  };

  const handleDrop = (fieldName: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    if (status === "loading") return;
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      setDropError("엑셀 파일(.xlsx, .xls)만 올릴 수 있습니다.");
      return;
    }
    selectFile(fieldName, file);
  };

  const reset = () => {
    setFiles({ [fields[0].name]: null, [fields[1].name]: null });
    setDropError(null);
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

  const stageSummary = result?.stats
    ? stageLabels
        .map((s) => `${s.label} ${result.stats?.[s.key] ?? 0}건`)
        .concat(`미매칭 ${result.stats?.unmatched ?? 0}건`)
        // 항목 안(예: "미매칭 0건")에서는 줄이 바뀌지 않게 공백을 붙는 공백으로 바꿉니다.
        .map((item) => item.replace(/ /g, " "))
        .join(" · ")
    : null;

  return (
    <div
      className="cs-tool"
      style={{ ["--accent" as string]: accentColor }}
      // 카드 밖에 파일을 떨어뜨려도 브라우저가 파일을 열어버리지 않게 막습니다.
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      <h2 className="cs-tool__title">{title}</h2>

      <div className="cs-upload-row">
        {fields.map((field, index) => (
          <div
            className={`cs-upload-card${dragOver === field.name ? " is-dragover" : ""}`}
            key={field.name}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = status === "loading" ? "none" : "copy";
              if (dragOver !== field.name) setDragOver(field.name);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragOver(null);
            }}
            onDrop={(e) => handleDrop(field.name, e)}
          >
            <div className="cs-upload-card__head">
              <span className="cs-upload-card__num">{index + 1}</span>
              <div>
                <label className="cs-upload-card__title" htmlFor={field.name}>
                  {field.label}
                </label>
                <p className="cs-upload-card__sub">
                  {dragOver === field.name
                    ? "여기에 놓으면 업로드됩니다"
                    : "Excel 파일 (.xlsx, .xls) · 끌어다 놓기 가능"}
                </p>
              </div>
            </div>

            <label className="cs-picker" htmlFor={field.name}>
              <span className="cs-picker__button">
                <FileIcon />
                파일 선택
              </span>
              <span
                className={`cs-picker__filename${files[field.name] ? " has-file" : ""}`}
                title={files[field.name]?.name}
              >
                {files[field.name]?.name ?? "선택된 파일 없음"}
              </span>
              <input
                key={resetKey}
                id={field.name}
                type="file"
                accept=".xlsx,.xls"
                disabled={status === "loading"}
                onChange={(e) => selectFile(field.name, e.target.files?.[0] ?? null)}
              />
            </label>
            {field.hint && <p className="cs-upload-card__hint">{field.hint}</p>}
          </div>
        ))}
      </div>

      {dropError && <p className="cs-drop-error">{dropError}</p>}

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
          <p className="cs-upload-card__hint">
            한 번 성공하면 이 브라우저에 기억해둬서 다음부터는 다시 입력하지 않아도 됩니다.
          </p>
        </div>
      )}

      <div className="cs-info">
        <span className="cs-info__icon" aria-hidden="true">i</span>
        <ul>
          <li>두 파일을 모두 선택하면 자동으로 처리가 시작됩니다.</li>
          <li>업로드한 파일은 서버에 저장되지 않고, 처리 후 즉시 메모리에서 삭제됩니다.</li>
        </ul>
      </div>

      {status === "loading" && (
        <div className="cs-result cs-result--progress">
          <span className="cs-spinner" aria-hidden="true" />
          <p className="cs-result__title">변환 중입니다...</p>
        </div>
      )}

      {result?.success && (
        <div className="cs-result cs-result--success">
          <span className="cs-result__icon" aria-hidden="true">
            <CheckIcon />
          </span>
          <div className="cs-result__body">
            <p className="cs-result__title">변환이 완료되었습니다.</p>
            <p className="cs-result__desc">
              변환된 결과 파일은 자동으로 다운로드됩니다.
              <br />
              버튼을 클릭하여 다시 다운로드할 수 있습니다.
            </p>
            {stageSummary && (
              <p className="cs-result__stats">
                총&nbsp;{result.stats?.total ?? 0}건 · {stageSummary}
              </p>
            )}
          </div>
          <div className="cs-result__actions">
            {downloadUrl && result.filename && (
              <a className="cs-btn cs-btn--primary" href={downloadUrl} download={result.filename}>
                <DownloadIcon />
                {downloadLabel}
              </a>
            )}
            <button type="button" className="cs-btn cs-btn--ghost" onClick={reset}>
              <ResetIcon />
              초기화
            </button>
          </div>
        </div>
      )}

      {result && !result.success && (
        <div className="cs-result cs-result--error">
          <span className="cs-result__icon" aria-hidden="true">!</span>
          <div className="cs-result__body">
            <p className="cs-result__title">변환하지 못했습니다.</p>
            <p className="cs-result__desc">{result.error}</p>
            {stageSummary && <p className="cs-result__stats">{stageSummary}</p>}
            {result.unmatched && result.unmatched.length > 0 && (
              <ul className="cs-unmatched-list">
                {result.unmatched.map((id) => (
                  <li key={id}>{id}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="cs-result__actions">
            <button
              type="button"
              className="cs-btn cs-btn--ghost"
              onClick={result.passwordError ? retry : reset}
            >
              <ResetIcon />
              {result.passwordError ? "다시 시도" : "초기화"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}
