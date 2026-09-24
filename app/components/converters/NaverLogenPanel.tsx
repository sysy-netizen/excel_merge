import UploadConverter from "./UploadConverter";

export default function NaverLogenPanel() {
  return (
    <UploadConverter
      title="네이버 스마트스토어 × 로젠택배"
      endpoint="/tools/excel-converter/api/naver-logen"
      accentColor="rgb(3, 199, 90)"
      fields={[
        {
          name: "naver",
          label: "① 네이버 파일 업로드 (.xlsx, .xls)",
          hint: "예) 스마트스토어_선택주문발주발송관리.xlsx",
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
        { key: "stage3", label: "3차 매칭" },
      ]}
      passwordField={{
        name: "naverPassword",
        label: "네이버 파일 비밀번호",
        storageKey: "cs-excel-merge-naver-password",
      }}
    />
  );
}
