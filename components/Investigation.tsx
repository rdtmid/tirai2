import React, { useState } from 'react';
import { Briefcase, FileText, Plus, Search, User, Clock, Shield, Archive, AlertTriangle, Hash, FileImage, Link as LinkIcon, Lock, X, Brain, ArrowRight } from 'lucide-react';
import { CaseFile, CaseEvidence } from '../types';

// Mock data representing recent findings from the Intelligence module
const RECENT_INTEL_FINDINGS = [
    { id: 'intel-1', type: 'TEXT' as const, content: 'Entity: "DarkVendor_99"', notes: 'High confidence match from AI analysis of Dread forum dump.', source: 'Intel Report #402' },
    { id: 'intel-2', type: 'CRYPTO' as const, content: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', notes: 'Wallet flagged with 92/100 risk score in crypto forensics.', source: 'Trace #881' },
    { id: 'intel-3', type: 'NETWORK' as const, content: 'Relay Node: France -> Germany', notes: 'Common circuit pattern for target site.', source: 'Crawler Log' },
];

interface InvestigationProps {
    cases: CaseFile[];
    onAddEvidence: (caseId: string, evidence: CaseEvidence) => void;
    onUpdateCase: (updatedCase: CaseFile) => void;
}

const Investigation: React.FC<InvestigationProps> = ({ cases, onAddEvidence, onUpdateCase }) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [evidenceSearchTerm, setEvidenceSearchTerm] = useState('');
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);

  // Form State
  const [newEvidenceType, setNewEvidenceType] = useState<CaseEvidence['type']>('TEXT');
  const [newEvidenceContent, setNewEvidenceContent] = useState('');
  const [newEvidenceNotes, setNewEvidenceNotes] = useState('');

  const activeCase = selectedCaseId ? cases.find(c => c.id === selectedCaseId) || null : null;

  const filteredCases = cases.filter(c => 
    c.codename.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'CRITICAL': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'HIGH': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  const handleAddEvidence = () => {
    if (!activeCase || !newEvidenceContent) return;

    const newEvidence: CaseEvidence = {
        id: `ev-${Date.now()}`,
        type: newEvidenceType,
        content: newEvidenceContent,
        timestamp: new Date().toISOString().split('T')[0],
        notes: newEvidenceNotes
    };

    onAddEvidence(activeCase.id, newEvidence);
    setIsEvidenceModalOpen(false);
    resetForm();
  };

  const handleCloseCase = () => {
      if (!activeCase) return;
      onUpdateCase({
          ...activeCase,
          status: 'CLOSED'
      });
  };

  const importIntel = (item: typeof RECENT_INTEL_FINDINGS[0]) => {
      setNewEvidenceType(item.type);
      setNewEvidenceContent(item.content);
      setNewEvidenceNotes(`${item.notes} (Source: ${item.source})`);
  };

  const resetForm = () => {
      setNewEvidenceContent('');
      setNewEvidenceNotes('');
      setNewEvidenceType('TEXT');
  }

  return (
    <div className="flex h-full gap-6 animate-fade-in relative">
      
      {/* Sidebar: Case List */}
      <div className="w-1/3 flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Briefcase className="text-emerald-500" /> Case Files
            </h2>
            <button className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition shadow-lg shadow-emerald-900/20">
                <Plus size={18} />
            </button>
        </div>

        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
                type="text" 
                placeholder="Search cases..." 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {filteredCases.map(caseFile => (
                <div 
                    key={caseFile.id}
                    onClick={() => {
                        setSelectedCaseId(caseFile.id);
                        setEvidenceSearchTerm(''); // Reset evidence search on case switch
                    }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        activeCase?.id === caseFile.id 
                        ? 'bg-slate-800 border-emerald-500 shadow-md' 
                        : 'bg-slate-900/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono text-slate-500">{caseFile.id}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${getPriorityColor(caseFile.priority)}`}>
                            {caseFile.priority}
                        </span>
                    </div>
                    <h3 className="font-bold text-slate-200 mb-1">{caseFile.codename}</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><User size={12}/> {caseFile.leadAgent}</span>
                        <span className="flex items-center gap-1"><Clock size={12}/> {caseFile.startDate}</span>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Main: Case Details */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col shadow-2xl">
        {activeCase ? (
            <>
                {/* Case Header */}
                <div className="p-6 border-b border-slate-800 bg-slate-800/30">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold text-white">{activeCase.codename}</h1>
                                {activeCase.status === 'CLOSED' && (
                                    <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded font-bold border border-slate-600">ARCHIVED</span>
                                )}
                            </div>
                            <p className="text-sm font-mono text-slate-500">ID: {activeCase.id} • LEAD: {activeCase.leadAgent}</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded text-sm font-medium transition flex items-center gap-2">
                                <FileText size={16} /> Generate Report
                            </button>
                            {activeCase.status !== 'CLOSED' && (
                                <button 
                                    onClick={handleCloseCase}
                                    className="px-4 py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 text-red-400 rounded text-sm font-medium transition flex items-center gap-2"
                                >
                                    <Archive size={16} /> Close Case
                                </button>
                            )}
                        </div>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/50 p-4 rounded border border-slate-800">
                        {activeCase.description}
                    </p>
                </div>

                {/* Dashboard Grid */}
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Subjects */}
                        <div className="bg-slate-950/30 rounded border border-slate-800 p-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                <User size={16} /> Subjects of Interest
                            </h3>
                            <div className="space-y-2">
                                {activeCase.associatedSubjects.length > 0 ? (
                                    activeCase.associatedSubjects.map((sub, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-900 rounded border border-slate-800">
                                            <span className="text-sm text-slate-300 font-mono">{sub}</span>
                                            <button className="text-xs text-emerald-500 hover:text-emerald-400 font-bold">PROFILE</button>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-slate-600 italic text-sm">No subjects identified.</span>
                                )}
                            </div>
                        </div>

                         {/* Status */}
                         <div className="bg-slate-950/30 rounded border border-slate-800 p-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                <Shield size={16} /> Investigation Status
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-3/4"></div>
                                </div>
                                <span className="text-sm font-bold text-emerald-500">75%</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Evidence collection active. Surveillance teams deployed.</p>
                        </div>
                    </div>

                    {/* Evidence Locker */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
                                <Lock size={16} /> Digital Evidence Locker
                            </h3>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" size={12} />
                                    <input 
                                        type="text" 
                                        placeholder="Filter evidence..." 
                                        value={evidenceSearchTerm}
                                        onChange={(e) => setEvidenceSearchTerm(e.target.value)}
                                        className="bg-slate-950 border border-slate-700 rounded py-1 pl-7 pr-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 w-48 transition"
                                    />
                                </div>
                                <button 
                                    onClick={() => setIsEvidenceModalOpen(true)}
                                    className="text-xs flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded transition"
                                >
                                    <Plus size={14} /> Add Evidence
                                </button>
                            </div>
                        </div>
                        <div className="border border-slate-800 rounded-lg overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-950 text-slate-500 font-mono text-xs uppercase">
                                    <tr>
                                        <th className="p-3">Type</th>
                                        <th className="p-3">Content / Artifact</th>
                                        <th className="p-3">Date Acquired</th>
                                        <th className="p-3">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {activeCase.evidence.filter(ev => 
                                        ev.content.toLowerCase().includes(evidenceSearchTerm.toLowerCase()) || 
                                        ev.notes.toLowerCase().includes(evidenceSearchTerm.toLowerCase()) ||
                                        ev.type.toLowerCase().includes(evidenceSearchTerm.toLowerCase())
                                    ).length > 0 ? (
                                        activeCase.evidence.filter(ev => 
                                            ev.content.toLowerCase().includes(evidenceSearchTerm.toLowerCase()) || 
                                            ev.notes.toLowerCase().includes(evidenceSearchTerm.toLowerCase()) ||
                                            ev.type.toLowerCase().includes(evidenceSearchTerm.toLowerCase())
                                        ).map((ev) => (
                                            <tr key={ev.id} className="hover:bg-slate-800/50 transition bg-slate-900/20">
                                                <td className="p-3 text-slate-400">
                                                    {ev.type === 'CRYPTO' && <Hash size={16} />}
                                                    {ev.type === 'TEXT' && <FileText size={16} />}
                                                    {ev.type === 'IMAGE' && <FileImage size={16} />}
                                                    {ev.type === 'NETWORK' && <LinkIcon size={16} />}
                                                </td>
                                                <td className="p-3 text-slate-200 font-mono truncate max-w-xs">{ev.content}</td>
                                                <td className="p-3 text-slate-400">{ev.timestamp}</td>
                                                <td className="p-3 text-slate-500 italic">{ev.notes}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-slate-600 italic">
                                                {activeCase.evidence.length === 0 ? "No evidence logged yet." : "No matching evidence found."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 opacity-50">
                <Briefcase size={64} className="mb-4" />
                <h3 className="text-xl font-bold">Select a Case File</h3>
                <p>Choose an active investigation from the list to view details.</p>
            </div>
        )}
      </div>

      {/* Add Evidence Modal */}
      {isEvidenceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
              <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-w-2xl w-full flex overflow-hidden">
                  
                  {/* Left: Intel Stream */}
                  <div className="w-1/3 bg-slate-950 p-4 border-r border-slate-800 overflow-y-auto max-h-[500px]">
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                          <Brain size={14} /> Recent Intel
                      </h4>
                      <div className="space-y-2">
                          {RECENT_INTEL_FINDINGS.map(item => (
                              <div 
                                key={item.id} 
                                onClick={() => importIntel(item)}
                                className="p-3 bg-slate-900 border border-slate-800 rounded hover:border-emerald-500 cursor-pointer group transition"
                              >
                                  <div className="flex justify-between items-start mb-1">
                                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1 rounded">{item.type}</span>
                                      <ArrowRight size={12} className="text-slate-600 group-hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition" />
                                  </div>
                                  <p className="text-xs text-slate-200 font-mono truncate mb-1">{item.content}</p>
                                  <p className="text-[10px] text-slate-500 line-clamp-2">{item.notes}</p>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Right: Manual Entry */}
                  <div className="flex-1 p-6">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="text-lg font-bold text-white">Add Evidence</h3>
                          <button onClick={() => setIsEvidenceModalOpen(false)} className="text-slate-500 hover:text-white">
                              <X size={20} />
                          </button>
                      </div>

                      <div className="space-y-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Evidence Type</label>
                              <select 
                                value={newEvidenceType}
                                onChange={(e) => setNewEvidenceType(e.target.value as any)}
                                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
                              >
                                  <option value="TEXT">Text / Document</option>
                                  <option value="CRYPTO">Cryptocurrency Address</option>
                                  <option value="NETWORK">Network Artifact / IP</option>
                                  <option value="IMAGE">Image / Screenshot</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Content / Identifier</label>
                              <input 
                                type="text" 
                                value={newEvidenceContent}
                                onChange={(e) => setNewEvidenceContent(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-slate-200 font-mono focus:border-emerald-500 focus:outline-none"
                                placeholder="e.g. BTC Address, PGP Key, Username..."
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Analysis Notes</label>
                              <textarea 
                                value={newEvidenceNotes}
                                onChange={(e) => setNewEvidenceNotes(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none h-24 resize-none"
                                placeholder="Enter context or findings..."
                              />
                          </div>
                      </div>

                      <div className="mt-8 flex justify-end gap-3">
                          <button 
                            onClick={() => setIsEvidenceModalOpen(false)}
                            className="px-4 py-2 text-sm text-slate-400 hover:text-white font-medium"
                          >
                              Cancel
                          </button>
                          <button 
                            onClick={handleAddEvidence}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded shadow-lg shadow-emerald-900/20"
                          >
                              Save to Locker
                          </button>
                      </div>
                  </div>

              </div>
          </div>
      )}
    </div>
  );
};

export default Investigation;