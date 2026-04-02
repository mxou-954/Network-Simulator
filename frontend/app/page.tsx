"use client";
import { useCallback, useState, useRef, useMemo } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  ReactFlowProvider,
  useReactFlow,
  type Node,
  type Edge,
  type OnConnect,
  type NodeProps,
  type XYPosition,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const API = "http://localhost:8000";

/* ─── Custom Router Node ─── */
type RouterNodeData = {
  label: string;
  ip: string;
  isSource?: boolean;
  isDestination?: boolean;
  isOnPath?: boolean;
};

function RouterNode({ data }: NodeProps<Node<RouterNodeData>>) {
  const isSource = data.isSource;
  const isDest = data.isDestination;
  const isOnPath = data.isOnPath;

  const borderColor = isSource
    ? "#00ff88"
    : isDest
      ? "#4488ff"
      : isOnPath
        ? "#ff8800"
        : "#2a2a2a";

  const glowColor = isSource
    ? "0 0 20px #00ff8833"
    : isDest
      ? "0 0 20px #4488ff33"
      : isOnPath
        ? "0 0 20px #ff880033"
        : "none";

  return (
    <div
      style={{
        background: "#111",
        border: `1.5px solid ${borderColor}`,
        borderRadius: "12px",
        padding: "12px 16px",
        minWidth: "140px",
        fontFamily: "'JetBrains Mono', monospace",
        boxShadow: glowColor,
        transition: "all 0.3s ease",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: "#555",
          width: 8,
          height: 8,
          border: "2px solid #222",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "4px",
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#00ff88",
            boxShadow: "0 0 6px #00ff8866",
          }}
        />
        <span style={{ color: "#fff", fontSize: "13px", fontWeight: 500 }}>
          {data.label}
        </span>
      </div>
      <div style={{ color: "#666", fontSize: "11px", paddingLeft: "16px" }}>
        {data.ip}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: "#555",
          width: 8,
          height: 8,
          border: "2px solid #222",
        }}
      />
    </div>
  );
}

const nodeTypes = { router: RouterNode };

/* ─── Context Menu ─── */
function ContextMenu({
  x,
  y,
  onAddRouter,
  onClose,
}: {
  x: number;
  y: number;
  onAddRouter: () => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        zIndex: 1000,
        background: "#1a1a1a",
        border: "1px solid #2a2a2a",
        borderRadius: "8px",
        padding: "4px",
        fontFamily: "'JetBrains Mono', monospace",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      }}
      onMouseLeave={onClose}
    >
      <button
        onClick={onAddRouter}
        style={{
          display: "block",
          width: "100%",
          padding: "8px 16px",
          background: "transparent",
          border: "none",
          color: "#e0e0e0",
          fontSize: "12px",
          fontFamily: "inherit",
          cursor: "pointer",
          borderRadius: "6px",
          textAlign: "left",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#222")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        + Ajouter un routeur
      </button>
    </div>
  );
}

/* ─── Add Router Modal ─── */
function AddRouterModal({
  onAdd,
  onClose,
}: {
  onAdd: (name: string, ip: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [ip, setIp] = useState("");

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#111",
          border: "1px solid #2a2a2a",
          borderRadius: "12px",
          padding: "24px",
          width: "320px",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <h3
          style={{
            color: "#fff",
            fontSize: "14px",
            margin: "0 0 16px",
            fontWeight: 500,
          }}
        >
          Nouveau routeur
        </h3>
        <input
          placeholder="Nom (ex: Routeur A)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          style={modalInputStyle}
        />
        <input
          placeholder="IP (ex: 192.168.1.1)"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && name && ip) onAdd(name, ip);
          }}
          style={modalInputStyle}
        />
        <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
          <button onClick={onClose} style={modalBtnSecondary}>
            Annuler
          </button>
          <button
            onClick={() => name && ip && onAdd(name, ip)}
            style={modalBtnPrimary}
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Send Packet Modal ─── */
function SendPacketModal({
  sourceIp,
  routers,
  onSend,
  onClose,
}: {
  sourceIp: string;
  routers: { name: string; ip: string }[];
  onSend: (destIp: string, payload: string) => void;
  onClose: () => void;
}) {
  const [destIp, setDestIp] = useState("");
  const [payload, setPayload] = useState("");
  const others = routers.filter((r) => r.ip !== sourceIp);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#111",
          border: "1px solid #2a2a2a",
          borderRadius: "12px",
          padding: "24px",
          width: "360px",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <h3
          style={{
            color: "#fff",
            fontSize: "14px",
            margin: "0 0 4px",
            fontWeight: 500,
          }}
        >
          Envoyer un paquet
        </h3>
        <p style={{ color: "#555", fontSize: "11px", margin: "0 0 16px" }}>
          Depuis {sourceIp}
        </p>
        <select
          value={destIp}
          onChange={(e) => setDestIp(e.target.value)}
          style={{ ...modalInputStyle, cursor: "pointer" }}
        >
          <option value="">-- Destination --</option>
          {others.map((r) => (
            <option key={r.ip} value={r.ip}>
              {r.name} ({r.ip})
            </option>
          ))}
        </select>
        <input
          placeholder="Message (payload)"
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && destIp && payload) onSend(destIp, payload);
          }}
          style={modalInputStyle}
        />
        <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
          <button onClick={onClose} style={modalBtnSecondary}>
            Annuler
          </button>
          <button
            onClick={() => destIp && payload && onSend(destIp, payload)}
            style={modalBtnPrimary}
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Toast ─── */
function Toast({
  message,
  type,
}: {
  message: string;
  type: "success" | "error" | "info";
}) {
  const colors = {
    success: { bg: "#0a2e1a", border: "#00ff8833", text: "#00ff88" },
    error: { bg: "#2e0a0a", border: "#ff444433", text: "#ff4444" },
    info: { bg: "#0a1a2e", border: "#4488ff33", text: "#4488ff" },
  };
  const c = colors[type];
  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 3000,
        padding: "10px 20px",
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: "8px",
        color: c.text,
        fontSize: "12px",
        fontFamily: "'JetBrains Mono', monospace",
        animation: "fadeIn 0.3s ease",
        whiteSpace: "nowrap",
      }}
    >
      {message}
    </div>
  );
}

/* ─── Path Result Panel ─── */
function PathPanel({ path, onClose }: { path: string[]; onClose: () => void }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1500,
        background: "#111",
        border: "1px solid #2a2a2a",
        borderRadius: "12px",
        padding: "16px 24px",
        fontFamily: "'JetBrains Mono', monospace",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <span
        style={{ color: "#555", fontSize: "11px", letterSpacing: "0.05em" }}
      >
        CHEMIN
      </span>
      {path.map((ip, i) => (
        <span
          key={i}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 500,
              background:
                i === 0
                  ? "#0a2e1a"
                  : i === path.length - 1
                    ? "#0a1a2e"
                    : "#1a1a1a",
              color:
                i === 0
                  ? "#00ff88"
                  : i === path.length - 1
                    ? "#4488ff"
                    : "#888",
              border: `1px solid ${
                i === 0
                  ? "#00ff8833"
                  : i === path.length - 1
                    ? "#4488ff33"
                    : "#222"
              }`,
            }}
          >
            {ip}
          </span>
          {i < path.length - 1 && (
            <span style={{ color: "#333", fontSize: "12px" }}>&#8594;</span>
          )}
        </span>
      ))}
      <button
        onClick={onClose}
        style={{
          background: "transparent",
          border: "none",
          color: "#555",
          fontSize: "16px",
          cursor: "pointer",
          marginLeft: "8px",
          padding: "0 4px",
        }}
      >
        &#215;
      </button>
    </div>
  );
}

/* ─── Main Flow Component ─── */
function NetworkFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<RouterNodeData>>(
    [],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    flowPos: XYPosition;
  } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [packetModal, setPacketModal] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [pathResult, setPathResult] = useState<string[] | null>(null);
  const pendingPosition = useRef<XYPosition>({ x: 0, y: 0 });
  const { screenToFlowPosition } = useReactFlow();

  const routers = useMemo(
    () => nodes.map((n) => ({ name: n.data.label, ip: n.data.ip })),
    [nodes],
  );

  function showToast(
    message: string,
    type: "success" | "error" | "info" = "success",
  ) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const flowPos = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      setContextMenu({ x: event.clientX, y: event.clientY, flowPos });
    },
    [screenToFlowPosition],
  );

  function handleContextAddRouter() {
    if (contextMenu) {
      pendingPosition.current = contextMenu.flowPos;
    }
    setContextMenu(null);
    setShowAddModal(true);
  }

  async function handleAddRouter(name: string, ip: string) {
    try {
      const res = await fetch(`${API}/routers?name=${name}&ip_address=${ip}`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.error) return showToast(data.error, "error");

      const newNode: Node<RouterNodeData> = {
        id: ip,
        type: "router",
        position: pendingPosition.current,
        data: { label: name, ip },
      };
      setNodes((nds) => [...nds, newNode]);
      setShowAddModal(false);
      showToast(`Routeur ${name} ajouté`);
    } catch {
      showToast("Erreur serveur", "error");
    }
  }

  const onConnect: OnConnect = useCallback(
    async (params) => {
      const sourceIp = params.source;
      const targetIp = params.target;
      if (!sourceIp || !targetIp) return;

      try {
        await fetch(
          `${API}/routes?source_ip=${sourceIp}&destination_ip=${targetIp}&next_hop_ip=${targetIp}`,
          { method: "POST" },
        );
        await fetch(
          `${API}/routes?source_ip=${targetIp}&destination_ip=${sourceIp}&next_hop_ip=${sourceIp}`,
          { method: "POST" },
        );

        setEdges((eds) =>
          addEdge(
            {
              ...params,
              type: "smoothstep",
              animated: false,
              style: { stroke: "#2a2a2a", strokeWidth: 1.5 },
            },
            eds,
          ),
        );
        showToast(`Route ${sourceIp} ↔ ${targetIp} créée`);
      } catch {
        showToast("Erreur lors de la création de la route", "error");
      }
    },
    [setEdges],
  );

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setPacketModal(node.id);
    },
    [],
  );

  async function handleSendPacket(destIp: string, payload: string) {
    const sourceIp = packetModal;
    setPacketModal(null);
    if (!sourceIp) return;

    try {
      const res = await fetch(
        `${API}/packets?source_ip=${sourceIp}&destination_ip=${destIp}&payload=${encodeURIComponent(payload)}`,
        { method: "POST" },
      );
      const data = await res.json();
      console.log("Packet : ", data);

      if (data.path && Array.isArray(data.path)) {
        setPathResult(data.path);

        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            data: {
              ...n.data,
              isSource: n.id === sourceIp,
              isDestination: n.id === destIp,
              isOnPath:
                data.path.includes(n.id) &&
                n.id !== sourceIp &&
                n.id !== destIp,
            },
          })),
        );

        setEdges((eds) =>
          eds.map((e) => {
            const pathSet = new Set(data.path as string[]);
            const onPath = pathSet.has(e.source!) && pathSet.has(e.target!);
            return {
              ...e,
              animated: onPath,
              style: {
                stroke: onPath ? "#00ff88" : "#2a2a2a",
                strokeWidth: onPath ? 2.5 : 1.5,
              },
            };
          }),
        );

        showToast(
          `Paquet livré en ${data.path.length - 1} saut${data.path.length - 1 !== 1 ? "s" : ""}`,
          "success",
        );

        setTimeout(() => {
          setNodes((nds) =>
            nds.map((n) => ({
              ...n,
              data: {
                ...n.data,
                isSource: false,
                isDestination: false,
                isOnPath: false,
              },
            })),
          );
          setEdges((eds) =>
            eds.map((e) => ({
              ...e,
              animated: false,
              style: { stroke: "#2a2a2a", strokeWidth: 1.5 },
            })),
          );
        }, 5000);
      } else {
        showToast("Le paquet n'a pas pu atteindre sa destination", "error");
      }
    } catch {
      showToast("Erreur serveur", "error");
    }
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#0a0a0a",
        position: "relative",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap"
        rel="stylesheet"
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(to bottom, #0a0a0a, transparent)",
          pointerEvents: "none",
        }}
      >
        <div style={{ pointerEvents: "auto" }}>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "14px",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.03em",
            }}
          >
            <span style={{ color: "#00ff88" }}>&#9679;</span> network simulator
          </span>
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "11px",
            color: "#444",
            display: "flex",
            gap: "16px",
            pointerEvents: "auto",
          }}
        >
          <span>clic droit = ajouter routeur</span>
          <span>glisser entre noeuds = ajouter route</span>
          <span>double-clic = envoyer paquet</span>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneContextMenu={onPaneContextMenu}
        onPaneClick={() => setContextMenu(null)}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        style={{ background: "#0a0a0a" }}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { stroke: "#2a2a2a", strokeWidth: 1.5 },
        }}
      >
        <Background color="#1a1a1a" gap={24} size={1} />
        <Controls
          position="bottom-left"
          style={{
            background: "#111",
            border: "1px solid #2a2a2a",
            borderRadius: "8px",
          }}
        />
        <MiniMap
          position="bottom-right"
          nodeColor="#00ff88"
          maskColor="rgba(0,0,0,0.7)"
          style={{
            background: "#111",
            border: "1px solid #2a2a2a",
            borderRadius: "8px",
          }}
        />
      </ReactFlow>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onAddRouter={handleContextAddRouter}
          onClose={() => setContextMenu(null)}
        />
      )}

      {showAddModal && (
        <AddRouterModal
          onAdd={handleAddRouter}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {packetModal && (
        <SendPacketModal
          sourceIp={packetModal}
          routers={routers}
          onSend={handleSendPacket}
          onClose={() => setPacketModal(null)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}

      {pathResult && (
        <PathPanel path={pathResult} onClose={() => setPathResult(null)} />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px) translateX(-50%); }
          to { opacity: 1; transform: translateY(0) translateX(-50%); }
        }
        .react-flow__controls button {
          background: #111 !important;
          border-color: #2a2a2a !important;
          color: #888 !important;
        }
        .react-flow__controls button:hover {
          background: #222 !important;
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  return (
    <ReactFlowProvider>
      <NetworkFlow />
    </ReactFlowProvider>
  );
}

const modalInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  background: "#1a1a1a",
  border: "1px solid #2a2a2a",
  borderRadius: "6px",
  color: "#e0e0e0",
  fontSize: "12px",
  fontFamily: "'JetBrains Mono', monospace",
  outline: "none",
  marginBottom: "8px",
  boxSizing: "border-box",
};

const modalBtnPrimary: React.CSSProperties = {
  flex: 1,
  padding: "8px",
  background: "#00ff88",
  border: "none",
  borderRadius: "6px",
  color: "#0a0a0a",
  fontSize: "12px",
  fontFamily: "'JetBrains Mono', monospace",
  fontWeight: 500,
  cursor: "pointer",
};

const modalBtnSecondary: React.CSSProperties = {
  flex: 1,
  padding: "8px",
  background: "transparent",
  border: "1px solid #2a2a2a",
  borderRadius: "6px",
  color: "#888",
  fontSize: "12px",
  fontFamily: "'JetBrains Mono', monospace",
  cursor: "pointer",
};
