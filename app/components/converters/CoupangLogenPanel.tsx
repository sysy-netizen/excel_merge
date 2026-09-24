import UploadConverter from "./UploadConverter";

export default function CoupangLogenPanel() {
  return (
    <UploadConverter
      title="쿠팡 윙 × 로젠택배"
      endpoint="/tools/excel-converter/api/coupang-logen"
      accentColor="rgb(61, 172, 220)"
      fields={[
        {
          name: "coupang",
          label: "① 쿠팡 파일 업로드 (.xlsx, .xls)",
        },
        {
          name: "logen",
          label: "② 로젠 파일 업로드 (.xlsx, .xls)",
          hint: "예) 주문등록_출력(복수건)_출력완료(**)건.xlsx",
        },
      ]}
      stageLabels={[
        { key: "stage1", label: "1차 매칭" },
        { key: "stage2", label: "2차 매칭" },
      ]}
    />
  );
}
