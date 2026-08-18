"use client";

import ReactMarkdown from "react-markdown";

interface ResponseCardProps {
  response: {
    content: string;
    provider: string;
    model: string;
  };
}

export default function ResponseCard({ response }: ResponseCardProps) {
  return (
    <div className="mt-6 p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Resposta</h2>
        <span className="text-xs px-2 py-1 bg-slate-100 text-slate-500 rounded">
          {response.provider} / {response.model}
        </span>
      </div>

      <div className="prose prose-slate prose-sm max-w-none">
        <ReactMarkdown>{response.content}</ReactMarkdown>
      </div>
    </div>
  );
}
