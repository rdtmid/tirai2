import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { OnionSite, ThreatLevel } from '../types';
import { X, ExternalLink, ShieldAlert, Activity, Calendar, FileText, Globe, Wifi, Share2 } from 'lucide-react';

interface NetworkGraphProps {
  data: OnionSite[];
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<OnionSite | null>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = 400;

    // Clear previous render
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    // Process nodes and links
    const nodes = data.map(d => ({ ...d })); // Shallow copy
    const links: any[] = [];
    
    data.forEach(site => {
      site.connections.forEach(targetId => {
        // Only create link if target exists in data
        if (data.find(d => d.id === targetId)) {
          links.push({ source: site.id, target: targetId });
        }
      });
    });

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke", "#334155") // Slate-700
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1.5);

    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 8)
      .attr("fill", (d: any) => {
        if (d.threatLevel === ThreatLevel.CRITICAL) return "#ef4444"; // Red
        if (d.threatLevel === ThreatLevel.HIGH) return "#f97316"; // Orange
        if (d.threatLevel === ThreatLevel.MEDIUM) return "#eab308"; // Yellow
        return "#10b981"; // Emerald
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .style("cursor", "pointer")
      .on("click", (event: any, d: any) => {
        event.stopPropagation();
        setSelectedNode(d as unknown as OnionSite);
      })
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.append("title")
      .text((d: any) => `${d.title} (${d.threatLevel})`);

    const labels = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text((d: any) => d.url.substring(0, 10) + '...')
      .attr("fill", "#94a3b8") // Slate-400
      .style("font-size", "10px")
      .style("font-family", "monospace")
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      labels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data]);

  // Helper to get connected sites
  const getConnectedSites = () => {
    if (!selectedNode) return [];
    return data.filter(site => selectedNode.connections.includes(site.id));
  };

  const connectedSites = getConnectedSites();

  return (
    <div className="relative">
      <div className="w-full bg-slate-900 rounded-lg border border-slate-700 overflow-hidden shadow-xl">
        <div className="px-4 py-2 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-slate-200">Network Topology</h3>
          <span className="text-xs text-slate-400">Force Directed Graph</span>
        </div>
        <svg ref={svgRef} className="w-full h-[400px] cursor-move bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
      </div>

      {/* Node Details Modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedNode(null)}>
          <div 
            className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-w-md w-full overflow-hidden relative transform transition-all"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-700 bg-slate-800/80 flex justify-between items-start">
              <div className="flex items-start gap-3">
                 <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                    <Globe size={24} className={
                        selectedNode.threatLevel === 'CRITICAL' ? 'text-red-500' :
                        selectedNode.threatLevel === 'HIGH' ? 'text-orange-500' :
                        'text-emerald-500'
                    } />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{selectedNode.title}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-1">{selectedNode.url}</p>
                 </div>
              </div>
              <button 
                onClick={() => setSelectedNode(null)}
                className="text-slate-500 hover:text-white transition p-1 hover:bg-slate-800 rounded"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
               {/* Status Grid */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/50 p-3 rounded border border-slate-800">
                      <div className="flex items-center gap-2 mb-1">
                          <Wifi size={14} className="text-slate-500" />
                          <span className="text-[10px] uppercase font-bold text-slate-500">Status</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <span className={`relative flex h-2 w-2`}>
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${selectedNode.status === 'ONLINE' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${selectedNode.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          </span>
                          <span className="text-sm font-mono font-semibold text-slate-200">{selectedNode.status}</span>
                      </div>
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded border border-slate-800">
                      <div className="flex items-center gap-2 mb-1">
                          <ShieldAlert size={14} className="text-slate-500" />
                          <span className="text-[10px] uppercase font-bold text-slate-500">Threat Level</span>
                      </div>
                      <span className={`text-sm font-bold ${
                           selectedNode.threatLevel === 'CRITICAL' ? 'text-red-500' :
                           selectedNode.threatLevel === 'HIGH' ? 'text-orange-500' :
                           selectedNode.threatLevel === 'MEDIUM' ? 'text-yellow-500' :
                           'text-emerald-500'
                      }`}>
                          {selectedNode.threatLevel}
                      </span>
                  </div>
               </div>

               {/* Info List */}
               <div className="space-y-3 pt-2">
                   <div className="flex items-center justify-between text-sm py-2 border-b border-slate-800/50">
                       <span className="text-slate-400 flex items-center gap-2"><Activity size={14}/> Category</span>
                       <span className="text-slate-200 font-medium bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-700">{selectedNode.category}</span>
                   </div>
                   <div className="flex items-center justify-between text-sm py-2 border-b border-slate-800/50">
                       <span className="text-slate-400 flex items-center gap-2"><Calendar size={14}/> Last Seen</span>
                       <span className="text-slate-200 font-mono text-xs">{new Date(selectedNode.lastSeen).toLocaleString()}</span>
                   </div>
               </div>
               
               {/* Connections */}
               {connectedSites.length > 0 && (
                   <div className="pt-2">
                       <div className="flex items-center gap-2 mb-2">
                          <Share2 size={14} className="text-slate-500" />
                          <span className="text-xs font-bold text-slate-400 uppercase">Connections</span>
                       </div>
                       <div className="space-y-2">
                           {connectedSites.map(site => (
                               <div key={site.id} className="flex items-center justify-between bg-slate-950/50 p-2 rounded border border-slate-800/50">
                                   <span className="text-xs text-slate-300 font-mono truncate w-3/4">{site.url}</span>
                                   <div 
                                      className={`w-2 h-2 rounded-full ${
                                        site.threatLevel === 'CRITICAL' ? 'bg-red-500' :
                                        site.threatLevel === 'HIGH' ? 'bg-orange-500' :
                                        site.threatLevel === 'MEDIUM' ? 'bg-yellow-500' :
                                        'bg-emerald-500'
                                      }`}
                                      title={`Threat Level: ${site.threatLevel}`}
                                   />
                               </div>
                           ))}
                       </div>
                   </div>
               )}

               {/* Snippet */}
               {selectedNode.contentSnippet && (
                   <div className="pt-2">
                       <div className="flex items-center gap-2 mb-2">
                          <FileText size={14} className="text-slate-500" />
                          <span className="text-xs font-bold text-slate-400 uppercase">Intercepted Snippet</span>
                       </div>
                       <div className="bg-slate-950 p-3 rounded border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed max-h-32 overflow-y-auto">
                           "{selectedNode.contentSnippet}"
                       </div>
                   </div>
               )}
            </div>

            {/* Actions */}
            <div className="p-4 bg-slate-800/50 border-t border-slate-700 flex justify-end gap-2">
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition"
                >
                  Close
                </button>
                <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded flex items-center gap-2 transition shadow-lg shadow-emerald-900/20">
                    <ExternalLink size={14} /> Open in Secure Browser
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkGraph;