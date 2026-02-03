import { useState } from "react";
import { RefreshCw, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import FileUpload from "@/components/FileUpload";
import AnalysisLoader from "@/components/AnalysisLoader";
import TrustScore from "@/components/TrustScore";
import ResultCard from "@/components/ResultCard";
import FindingsPanel from "@/components/FindingsPanel";
import AdviceSection from "@/components/AdviceSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeDocuments, type AnalysisResult } from "@/utils/mockAnalysis";

type DashboardState = "upload" | "analyzing" | "results";

const Dashboard = () => {
  const [state, setState] = useState<DashboardState>("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (files.length === 0) return;

    setState("analyzing");

    try {
      const analysisResult = await analyzeDocuments(files);
      setResult(analysisResult);
      setState("results");
    } catch (error) {
      console.error("Analysis failed:", error);
      setState("upload");
    }
  };

  const handleReset = () => {
    setFiles([]);
    setResult(null);
    setState("upload");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Job Offer Analysis</h1>
          <p className="text-muted-foreground">
            Upload documents to check if a job offer is genuine or a potential scam
          </p>
        </div>

        {/* Upload State */}
        {state === "upload" && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Upload Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FileUpload
                  onFilesSelected={handleFilesSelected}
                  selectedFiles={files}
                  onRemoveFile={handleRemoveFile}
                />

                <Button
                  onClick={handleAnalyze}
                  disabled={files.length === 0}
                  className="w-full"
                  size="lg"
                >
                  Analyze Documents
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analyzing State */}
        {state === "analyzing" && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="py-8">
                <AnalysisLoader />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results State */}
        {state === "results" && result && (
          <div className="animate-fade-in">
            {/* Results Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Analysis Complete</h2>
                <p className="text-muted-foreground">
                  Based on {files.length} document{files.length > 1 ? "s" : ""} analyzed
                </p>
              </div>
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Analyze Another
              </Button>
            </div>

            {/* Results Grid */}
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Left Column - Score & Status */}
              <div className="space-y-6">
                {/* Trust Score Card */}
                <Card className="animate-scale-in">
                  <CardHeader>
                    <CardTitle className="text-center">Trust Score</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center pb-8">
                    <TrustScore score={result.score} />
                  </CardContent>
                </Card>

                {/* Result Status Card */}
                <ResultCard status={result.status} />
              </div>

              {/* Right Column - Findings & Advice */}
              <div className="lg:col-span-2 space-y-6">
                <FindingsPanel findings={result.findings} />
                <AdviceSection advice={result.advice} status={result.status} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
