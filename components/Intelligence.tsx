import React, { useState } from 'react';
import { Brain, AlertTriangle, FileSearch, ArrowRight, Save, Database, X, Briefcase } from 'lucide-react';
import { analyzeTorContent } from '../services/geminiService';
import { AnalysisResult, CaseFile, CaseEvidence } from '../types';

interface IntelligenceProps {
    cases?: CaseFile[];
    onAddEvidence?: (caseId: string, evidence: CaseEvidence) => void;
}

const Intelligence: React.FC<IntelligenceProps> = ({ cases = [], onAddEvidence }) => {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    
    const analysis = await analyzeTorContent(inputText);
    
    setResult(analysis);
    setIsAnalyzing(false);
  };

  const handleSaveToCase = (caseId: string) => {
      if (!result || !onAddEvidence) return;

      const evidence: CaseEvidence = {
          id: `ev-ai-${Date.now()}`,
          type: 'TEXT',
          content: `AI Analysis: ${result.category}`,
          timestamp: new Date().toISOString().split('T')[0],
          notes: `Summary: ${result.summary}\nThreat Score: ${result.threatScore}\nEntities: ${result.entities.join(', ')}\nRecommended Action: ${result.suggestedAction}`
      };

      onAddEvidence(caseId, evidence);
      setSaveModalOpen(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full relative">
      
      {/* Input Section */}
      <div className="flex flex-col space-y-4">
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Brain className="text-purple-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-100">AI Analyst</h2>
                        <p className="text-xs text-slate-400">Powered by Gemini 3 Flash</p>
                    </div>
                </div>
            </div>

            <textarea
                className="flex-1 w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-300 font-mono text-sm focus:outline-none focus:border-purple-500 resize-none"
                placeholder="Paste intercepted text content, HTML snippets, or PGP messages here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
            />

            <div className="mt-4 flex justify-end">
                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !inputText}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-all ${
                        isAnalyzing ? 'bg-slate-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-900/20'
                    }`}
                >
                    {isAnalyzing ? (
                        <>Processing...</>
                    ) : (
                        <>
                            <FileSearch size={18} /> Run Analysis
                        </>
                    )}
                </button>
            </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="flex flex-col">
        {result ? (
            <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-lg overflow-hidden animate-fade-in flex-1">
                {/* Header with Threat Score */}
                <div className="p-6 border-b border-slate-700 bg-slate-800/50">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Classification</span>
                            <h3 className="text-2xl font-bold text-white mt-1">{result.category}</h3>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Threat Score</span>
                            <div className={`text-3xl font-mono font-bold mt-1 ${
                                result.threatScore > 75 ? 'text-red-500' : 
                                result.threatScore > 50 ? 'text-orange-500' : 'text-emerald-500'
                            }`}>
                                {result.threatScore}/100
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Summary */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                            <Database size={16} /> Intelligence Summary
                        </h4>
                        <p className="text-slate-400 text-sm leading-relaxed bg-slate-900/50 p-3 rounded border border-slate-700/50">
                            {result.summary}
                        </p>
                    </div>

                    {/* Entities */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                            <Brain size={16} /> Extracted Entities
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {result.entities.length > 0 ? (
                                result.entities.map((ent, idx) => (
                                    <span key={idx} className="text-xs font-mono bg-slate-700 text-slate-200 px-2 py-1 rounded border border-slate-600">
                                        {ent}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-slate-500 italic">No entities detected.</span>
                            )}
                        </div>
                    </div>

                    {/* Action */}
                    <div className="bg-red-500/10 border border-red-500/30 rounded p-4">
                         <h4 className="text-sm font-semibold text-red-400 mb-1 flex items-center gap-2">
                            <AlertTriangle size={16} /> Recommended Action
                        </h4>
                        <p className="text-slate-300 text-sm">
                            {result.suggestedAction}
                        </p>
                    </div>
                </div>
                
                <div className="bg-slate-900 p-4 border-t border-slate-700 flex justify-end">
                    <button 
                        onClick={() => setSaveModalOpen(true)}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
                    >
                        <Save size={14} /> Save to Case File
                    </button>
                </div>
            </div>
        ) : (
            <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-lg flex-1 flex flex-col items-center justify-center p-8 text-center opacity-50 border-dashed">
                <Brain size={64} className="text-slate-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-400">Awaiting Input</h3>
                <p className="text-slate-500 max-w-xs mt-2 text-sm">
                    Enter raw data from crawl logs or intercepted communications to generate a threat assessment.
                </p>
            </div>
        )}
      </div>

      {/* Save Modal */}
      {saveModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in rounded-lg">
             <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-w-md w-full overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Briefcase size={16} className="text-emerald-500"/> Select Case File
                    </h3>
                    <button onClick={() => setSaveModalOpen(false)} className="text-slate-500 hover:text-white">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {cases.filter(c => c.status === 'ACTIVE').length > 0 ? (
                        cases.filter(c => c.status === 'ACTIVE').map(c => (
                            <button
                                key={c.id}
                                onClick={() => handleSaveToCase(c.id)}
                                className="w-full text-left p-3 hover:bg-slate-800 rounded transition flex items-center justify-between group"
                            >
                                <div>
                                    <div className="font-bold text-sm text-slate-200">{c.codename}</div>
                                    <div className="text-xs text-slate-500 font-mono">{c.id}</div>
                                </div>
                                <ArrowRight size={14} className="text-slate-600 group-hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition" />
                            </button>
                        ))
                    ) : (
                        <div className="p-4 text-center text-slate-500 text-sm italic">
                            No active cases found. Create a new case in the Investigation module first.
                        </div>
                    )}
                </div>
             </div>
        </div>
      )}

    </div>
  );
};

export default Intelligence;