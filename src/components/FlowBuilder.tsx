"use client";

import React, { useCallback } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    BackgroundVariant,
    Handle,
    Position,
    useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const StartNode = ({ id, data }: any) => {
    const { updateNodeData } = useReactFlow();
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl py-3 px-6 shadow-lg shadow-black/20 flex items-center gap-3 min-w-[200px]">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)] flex-shrink-0"></div>
            <input
                type="text"
                value={data.label}
                onChange={(e) => updateNodeData(id, { label: e.target.value })}
                className="font-semibold text-white bg-transparent focus:outline-none w-full hover:bg-white/5 px-1 rounded transition-colors text-sm"
            />
            <Handle type="source" position={Position.Bottom} className="!bg-indigo-500 !w-4 !h-4 !border-2 !border-[#0b0f19] cursor-crosshair hover:scale-125 transition-transform" />
        </div>
    );
};

const RetNode = ({ id, data }: any) => {
    const { updateNodeData } = useReactFlow();
    return (
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl py-4 px-8 shadow-xl shadow-indigo-500/10 flex flex-col items-center min-w-[220px]">
            <Handle type="target" position={Position.Top} className="!bg-indigo-500 !w-4 !h-4 !border-2 !border-[#0b0f19] cursor-crosshair hover:scale-125 transition-transform" />
            <input
                type="text"
                value={data.label}
                onChange={(e) => updateNodeData(id, { label: e.target.value })}
                className="text-indigo-400 font-bold mb-1 text-sm tracking-widest text-center bg-transparent focus:outline-none w-full hover:bg-white/5 rounded transition-colors uppercase"
            />
            <input
                type="text"
                value={data.sub}
                onChange={(e) => updateNodeData(id, { sub: e.target.value })}
                className="text-slate-300 font-medium text-xs text-center bg-transparent focus:outline-none w-full hover:bg-white/5 rounded transition-colors"
                placeholder="Description"
            />
            <Handle type="source" position={Position.Bottom} className="!bg-pink-500 !w-4 !h-4 !border-2 !border-[#0b0f19] cursor-crosshair hover:scale-125 transition-transform" />
        </div>
    );
};

const LLMNode = ({ id, data }: any) => {
    const { updateNodeData } = useReactFlow();
    return (
        <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl py-4 px-8 shadow-xl shadow-pink-500/10 flex flex-col items-center min-w-[220px]">
            <Handle type="target" position={Position.Top} className="!bg-pink-500 !w-4 !h-4 !border-2 !border-[#0b0f19] cursor-crosshair hover:scale-125 transition-transform" />
            <input
                type="text"
                value={data.label}
                onChange={(e) => updateNodeData(id, { label: e.target.value })}
                className="text-pink-400 font-bold mb-1 text-sm tracking-widest text-center bg-transparent focus:outline-none w-full hover:bg-white/5 rounded transition-colors uppercase"
            />
            <input
                type="text"
                value={data.sub}
                onChange={(e) => updateNodeData(id, { sub: e.target.value })}
                className="text-slate-300 font-medium text-xs text-center bg-transparent focus:outline-none w-full hover:bg-white/5 rounded transition-colors"
                placeholder="Description"
            />
            <Handle type="source" position={Position.Bottom} className="!bg-white !w-4 !h-4 !border-2 !border-[#0b0f19] cursor-crosshair hover:scale-125 transition-transform" />
        </div>
    );
};

const EndNode = ({ id, data }: any) => {
    const { updateNodeData } = useReactFlow();
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl py-3 px-8 shadow-lg shadow-black/20 flex items-center gap-3 min-w-[200px] justify-center">
            <Handle type="target" position={Position.Top} className="!bg-white !w-4 !h-4 !border-2 !border-[#0b0f19] cursor-crosshair hover:scale-125 transition-transform" />
            <div className="w-3 h-3 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)] flex-shrink-0"></div>
            <input
                type="text"
                value={data.label}
                onChange={(e) => updateNodeData(id, { label: e.target.value })}
                className="font-semibold text-white bg-transparent focus:outline-none w-full text-center hover:bg-white/5 px-1 rounded transition-colors text-sm"
            />
        </div>
    );
};

const nodeTypes = {
    start: StartNode,
    ret: RetNode,
    llm: LLMNode,
    end: EndNode
};

const initialNodes = [
    { id: '1', position: { x: 250, y: 50 }, data: { label: 'START (User Query)' }, type: 'start' },
    { id: '2', position: { x: 250, y: 180 }, data: { label: 'RETRIEVAL NODE', sub: 'ChromaDB Context Search' }, type: 'ret' },
    { id: '3', position: { x: 250, y: 320 }, data: { label: 'LLM NODE', sub: 'Provider Logic Routing' }, type: 'llm' },
    { id: '4', position: { x: 250, y: 460 }, data: { label: 'END (Response)' }, type: 'end' },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true },
    { id: 'e2-3', source: '2', target: '3', animated: true },
    { id: 'e3-4', source: '3', target: '4', animated: true },
];

export default function FlowBuilder({ agent, showToast }: { agent: any, showToast?: any }) {

    // Natively attempt to derive the serialized nodes block from the backend payload format.
    let storedNodes = initialNodes;
    let storedEdges = initialEdges;
    if (agent && agent.flow_config) {
        try {
            const parsed = JSON.parse(agent.flow_config);
            if (parsed.nodes) storedNodes = parsed.nodes;
            if (parsed.edges) storedEdges = parsed.edges;
        } catch (e) { console.error("Could not parse flow JSON"); }
    }

    const [nodes, setNodes, onNodesChange] = useNodesState(storedNodes as any);
    const [edges, setEdges, onEdgesChange] = useEdgesState(storedEdges);

    const onConnect = useCallback(
        (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const onEdgeClick = useCallback(
        (event: any, edge: Edge) => {
            event.stopPropagation();
            setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        },
        [setEdges]
    );

    const handleAddNode = () => {
        const newNode = {
            id: `${nodes.length + Date.now()}`,
            position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
            data: { label: 'NEW MODULE', sub: 'Define Capability' },
            type: 'llm'
        };
        setNodes((nds) => nds.concat(newNode as any));
    };

    const handleSave = () => {
        console.log("Saving pipeline...", { nodes, edges });
        const payload = JSON.stringify({ nodes, edges });
        fetch(`http://localhost:8000/api/agents/${agent.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ flow_config: payload })
        }).catch(e => {
            console.error("Save mock failed", e);
            if (showToast) showToast("Failed to save pipeline configuration.", "error");
        }).then(() => {
            if (showToast) {
                showToast("Pipeline workflow updated successfully!", "success");
            } else {
                alert("Pipeline workflow updated successfully!");
            }
        });
    };

    return (
        <div className="w-full h-full flex flex-col relative" style={{ minHeight: '600px' }}>
            <div className="absolute top-4 right-4 z-10 flex gap-3">
                <button onClick={handleAddNode} className="px-4 py-2 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-lg text-sm font-bold shadow-xl backdrop-blur transition-all cursor-pointer truncate">
                    + Add Node
                </button>
                <button onClick={handleSave} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all cursor-pointer truncate">
                    Save Pipeline
                </button>
            </div>

            <div className="flex-1 w-full border border-white/10 rounded-2xl overflow-hidden bg-black/40 shadow-inner block">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onEdgeClick={onEdgeClick}
                    panOnScroll={true}
                    zoomOnScroll={false}
                    fitView
                    colorMode="dark"
                >
                    <Controls showInteractive={false} position="top-right" style={{ marginRight: '16px', marginTop: '64px' }} className="!bg-[#121826] border border-white/10 overflow-hidden rounded-lg shadow-2xl [&>button]:!border-white/5 [&>button]:!bg-[#121826] [&>button]:hover:!bg-white/5 [&>button>svg]:!fill-slate-300" />
                    <MiniMap zoomable pannable nodeColor="#4f46e5" maskColor="rgba(0,0,0,0.5)" />
                    <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#334155" />
                </ReactFlow>
            </div>
        </div>
    );
}
