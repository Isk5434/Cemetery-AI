"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";

interface ContractData {
  contract_holder: string;
  plot_number: string;
  contract_date: string;
  perpetual_lease_fee: number;
  management_fee: number;
  management_fee_cycle: string;
  transfer_conditions: string;
  cancellation_conditions: string;
  confidence_score: number;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [relationship, setRelationship] = useState("spouse");
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [checklist, setChecklist] = useState<{
    required_documents: string[];
    can_transfer: boolean;
    notes: string;
  } | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setLoading(true);
    setError(null);
    setContractData(null);
    setChecklist(null); // Reset checklist on new file

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:8000/api/v1/contracts/extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("OCR Extract Failed");
      }

      const data = await response.json();
      setContractData(data);
    } catch (err) {
      console.error(err);
      setError("データの読み取りに失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInheritance = async () => {
    if (!contractData) return;
    setChecklistLoading(true);
    try {
      // In a real app we would pass contract_id, but here we perform a simulation
      const response = await fetch("http://localhost:8000/api/v1/inheritance/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract_id: 0, // Mock ID
          heir_relationship: relationship
        }),
      });
      const data = await response.json();
      setChecklist(data);
    } catch (err) {
      console.error(err);
      alert("診断に失敗しました");
    } finally {
      setChecklistLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="text-center space-y-4">
        <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
          墓地契約書管理システム
        </h1>
        <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto">
          OCRとAI技術を活用し、紙の契約書をデジタル化。相続手続きのサポートまで一元管理します。
        </p>
      </section>

      {!contractData && (
        <section className="max-w-xl mx-auto">
          <div className="bg-card rounded-xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 text-center">新規契約書の登録</h2>
            <FileUpload onFileSelect={handleFileSelect} />
            {loading && (
              <div className="mt-4 text-center text-primary animate-pulse">
                解析中... (OCR & AI処理)
              </div>
            )}
            {error && (
              <div className="mt-4 text-center text-red-500">
                {error}
              </div>
            )}
          </div>
        </section>
      )}

      {contractData && (
        <section className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* OCR Result View */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold text-primary">抽出データ</h2>
              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full border border-primary/20">
                信頼度: {Math.round(contractData.confidence_score * 100)}%
              </span>
            </div>

            <dl className="space-y-4 text-sm">
              <div className="grid grid-cols-3 border-b border-muted pb-2">
                <dt className="text-muted-foreground">契約者名</dt>
                <dd className="col-span-2 font-medium">{contractData.contract_holder}</dd>
              </div>
              <div className="grid grid-cols-3 border-b border-muted pb-2">
                <dt className="text-muted-foreground">区画番号</dt>
                <dd className="col-span-2 font-medium">{contractData.plot_number}</dd>
              </div>
              <div className="grid grid-cols-3 border-b border-muted pb-2">
                <dt className="text-muted-foreground">契約日</dt>
                <dd className="col-span-2 font-medium">{contractData.contract_date}</dd>
              </div>
              <div className="grid grid-cols-3 border-b border-muted pb-2">
                <dt className="text-muted-foreground">永代使用料</dt>
                <dd className="col-span-2 font-medium">¥{contractData.perpetual_lease_fee?.toLocaleString()}</dd>
              </div>
              <div className="grid grid-cols-3 border-b border-muted pb-2">
                <dt className="text-muted-foreground">管理費</dt>
                <dd className="col-span-2 font-medium">¥{contractData.management_fee?.toLocaleString()} ({contractData.management_fee_cycle})</dd>
              </div>
            </dl>

            <div className="mt-6 space-y-4">
              <div>
                <h3 className="font-serif font-bold mb-2 text-foreground/80">名義変更条件 (抽出条文)</h3>
                <div className="bg-muted/50 p-3 rounded text-sm leading-relaxed whitespace-pre-wrap">
                  {contractData.transfer_conditions}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setContractData(null)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">キャンセル</button>
              <button className="px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded shadow hover:bg-primary/90 transition-colors">
                台帳に保存
              </button>
            </div>
          </div>

          {/* Inheritance Simulation Section */}
          <div className="bg-muted/30 rounded-xl border border-muted-foreground/20 p-6">
            <h3 className="text-xl font-serif font-bold text-primary mb-4 border-b border-primary/20 pb-2">
              相続シミュレーション
            </h3>

            {!checklist ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block p-4 rounded-lg border border-input bg-background hover:bg-muted/50 cursor-pointer transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input
                      type="radio"
                      name="relationship"
                      value="spouse"
                      className="mr-3 accent-primary"
                      checked={relationship === "spouse"}
                      onChange={(e) => setRelationship(e.target.value)}
                    />
                    <span className="font-medium">配偶者への承継</span>
                  </label>
                  <label className="block p-4 rounded-lg border border-input bg-background hover:bg-muted/50 cursor-pointer transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input
                      type="radio"
                      name="relationship"
                      value="child"
                      className="mr-3 accent-primary"
                      checked={relationship === "child"}
                      onChange={(e) => setRelationship(e.target.value)}
                    />
                    <span className="font-medium">子への承継</span>
                  </label>
                  <label className="block p-4 rounded-lg border border-input bg-background hover:bg-muted/50 cursor-pointer transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input
                      type="radio"
                      name="relationship"
                      value="third_party"
                      className="mr-3 accent-primary"
                      checked={relationship === "third_party"}
                      onChange={(e) => setRelationship(e.target.value)}
                    />
                    <span className="font-medium">第三者への承継 (親族外)</span>
                  </label>
                </div>

                <button
                  onClick={handleCheckInheritance}
                  disabled={checklistLoading || !relationship}
                  className="w-full py-3 bg-secondary text-secondary-foreground font-bold rounded-lg shadow hover:bg-secondary/90 transition-colors disabled:opacity-50"
                >
                  {checklistLoading ? "AI解析中..." : "必要書類・手続きを診断する"}
                </button>
                {error && !checklistLoading && (
                  <div className="mt-4 text-center text-red-500">
                    {error}
                  </div>
                )}
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className={`p-4 rounded-lg mb-6 border ${checklist.can_transfer ? "bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-900" : "bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-900"}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-2xl ${checklist.can_transfer ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {checklist.can_transfer ? "●" : "×"}
                    </span>
                    <h4 className="text-lg font-bold">
                      {checklist.can_transfer ? "名義変更 可能です" : "名義変更に制限があります"}
                    </h4>
                  </div>
                  <p className="text-sm text-foreground/80 pl-9">
                    {checklist.notes}
                  </p>
                </div>

                <h4 className="font-serif font-bold text-lg mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary inline-block"></span>
                  必要書類リスト
                </h4>
                <ul className="bg-background rounded-lg border p-4 space-y-2 mb-6 shadow-sm">
                  {checklist.required_documents.map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm leading-relaxed border-b last:border-0 border-muted border-dashed last:pb-0 pb-2">
                      <span className="text-primary font-serif font-bold min-w-[1.5em]">{idx + 1}.</span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setChecklist(null)}
                  className="text-sm text-muted-foreground hover:text-primary underline decoration-dotted"
                >
                  条件を変更して再診断
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
