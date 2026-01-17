"use client";

import React, { useMemo, useState } from "react";
import { cn } from "@/util/helper";
import type { Pod, PodStatus } from "@/lib/types/Pod";
import type { NodeId, NodeInfo } from "@/lib/types/Node";

type Metric = {
  label: string;
  value: string;
  hint?: string;
  percent?: number; // 0–100
};

const NODES: NodeInfo[] = [
  {
    id: "master-worker",
    label: "Master/Worker",
    subtitle: "Control-plane + workload node",
  },
  {
    id: "worker",
    label: "Worker",
    subtitle: "Workload-only node",
  },
];

// Replace with real data later (API/DB/WebSocket)
const METRICS_BY_NODE: Record<NodeId, Metric[]> = {
  "master-worker": [
    { label: "CPU Usage", value: "23%", percent: 23, hint: "avg last 5m" },
    { label: "Memory Usage", value: "5.1 / 16 GB", percent: 32 },
    { label: "Disk", value: "118 / 256 GB", percent: 46 },
    { label: "Network", value: "12 / 9 Mbps" }, // no bar yet
  ],
  "worker": [
    { label: "CPU Usage", value: "90%", percent: 90 },
    { label: "Memory Usage", value: "10.8 / 32 GB", percent: 34 },
    { label: "Disk", value: "202 / 512 GB", percent: 39 },
    { label: "Network", value: "28 / 22 Mbps" },
  ],
};

const PODS: Pod[] = [
  {
    id: "pod-1",
    name: "api-gateway",
    namespace: "default",
    status: "Running",
    cpu: "85m",
    memory: "190Mi",
    restarts: 0,
    node: "master-worker",
    updatedAt: "1m ago",
  },
  {
    id: "pod-2",
    name: "metrics-scraper",
    namespace: "observability",
    status: "Running",
    cpu: "40m",
    memory: "120Mi",
    restarts: 1,
    node: "master-worker",
    updatedAt: "6m ago",
  },
  {
    id: "pod-3",
    name: "worker-queue",
    namespace: "default",
    status: "Pending",
    cpu: "—",
    memory: "—",
    restarts: 0,
    node: "worker",
    updatedAt: "just now",
  },
  {
    id: "pod-4",
    name: "media-service",
    namespace: "default",
    status: "Crashed",
    cpu: "—",
    memory: "—",
    restarts: 7,
    node: "worker",
    updatedAt: "3m ago",
  },
];

function StatusDot({ status }: { status: PodStatus }) {
  const dotClass =
    status === "Running"
      ? "bg-emerald-500"
      : status === "Pending"
      ? "bg-amber-500"
      : status === "Stopped"
      ? "bg-zinc-400"
      : "bg-rose-500";

  return (
    <span className="inline-flex items-center gap-2 text-sm text-zinc-600">
      <span className={cn("h-2 w-2 rounded-full", dotClass)} />
      {status}
    </span>
  );
}

function UsageBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));

  const color =
    clamped < 60
      ? "bg-emerald-500"
      : clamped < 80
      ? "bg-amber-500"
      : "bg-rose-500";

  return (
    <div className="mt-3 h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all", color)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}


function Card({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-zinc-900">{title}</h3>
        {right}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function MetricCard({ label, value, hint, percent }: Metric) {
  return (
    <Card
      title={label}
      right={
        <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-600">
          Metric
        </span>
      }
    >
      <div className="flex items-end justify-between gap-4">
        <div className="text-3xl font-semibold tracking-tight text-zinc-900">
          {value}
        </div>
        {hint ? <div className="text-xs text-zinc-500">{hint}</div> : null}
      </div>

      {/* Usage bar */}
      {typeof percent === "number" ? (
        <UsageBar percent={percent} />
      ) : (
        <div
          title={`${percent}% used`}
          className="mt-3 h-2 w-full rounded-full bg-zinc-100 overflow-hidden"
        />
      )}
    </Card>
  );
}


function PodCard({ pod }: { pod: Pod }) {
  const pillClass =
    pod.status === "Running"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : pod.status === "Pending"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : pod.status === "Stopped"
      ? "border-zinc-200 bg-zinc-50 text-zinc-700"
      : "border-rose-200 bg-rose-50 text-rose-700";

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-zinc-900">
            {pod.name}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-xs text-zinc-500">
              ns: {pod.namespace ?? "—"}
            </span>
            <span className="text-xs text-zinc-500">
              node: {pod.node ?? "—"}
            </span>
            <span className="text-xs text-zinc-500">
              updated: {pod.updatedAt ?? "—"}
            </span>
          </div>
        </div>

        <span
          className={cn(
            "shrink-0 rounded-full border px-2 py-1 text-xs",
            pillClass
          )}
        >
          <StatusDot status={pod.status} />
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <div className="text-[11px] text-zinc-500">CPU</div>
          <div className="mt-1 text-sm font-medium text-zinc-900">
            {pod.cpu ?? "—"}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <div className="text-[11px] text-zinc-500">Memory</div>
          <div className="mt-1 text-sm font-medium text-zinc-900">
            {pod.memory ?? "—"}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <div className="text-[11px] text-zinc-500">Restarts</div>
          <div className="mt-1 text-sm font-medium text-zinc-900">
            {pod.restarts ?? "—"}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-zinc-500">pod id: {pod.id}</span>
        <button className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50">
          View logs
        </button>
      </div>
    </div>
  );
}

function NodeSwitcher({
  nodes,
  selected,
  onChange,
}: {
  nodes: NodeInfo[];
  selected: NodeId;
  onChange: (id: NodeId) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const selectedNode = nodes.find((n) => n.id === selected);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return nodes;
    return nodes.filter(
      (n) =>
        n.label.toLowerCase().includes(query) ||
        n.subtitle.toLowerCase().includes(query) ||
        n.id.toLowerCase().includes(query)
    );
  }, [nodes, q]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm hover:bg-zinc-50"
      >
        <span className="text-xs text-zinc-500">Node</span>
        <span className="font-medium">{selectedNode?.label ?? "Select"}</span>
        <span className="text-xs text-zinc-500 hidden sm:inline">
          {selectedNode?.subtitle ?? ""}
        </span>
        <svg
          viewBox="0 0 20 20"
          className="ml-1 h-4 w-4 text-zinc-500"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-[320px] rounded-2xl border border-zinc-200 bg-white p-2 shadow-lg">
          <div className="p-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search nodes…"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-200"
              autoFocus
            />
          </div>

          <div className="max-h-64 overflow-auto p-1">
            {filtered.map((n) => {
              const active = n.id === selected;
              return (
                <button
                  key={n.id}
                  onClick={() => {
                    onChange(n.id);
                    setOpen(false);
                    setQ("");
                  }}
                  className={cn(
                    "w-full rounded-xl px-3 py-2 text-left transition",
                    active ? "bg-zinc-900 text-white" : "hover:bg-zinc-50"
                  )}
                >
                  <div className="text-sm font-medium">{n.label}</div>
                  <div className={cn("text-xs", active ? "text-white/70" : "text-zinc-500")}>
                    {n.subtitle}
                  </div>
                </button>
              );
            })}

            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-sm text-zinc-600">
                No nodes match “{q}”.
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-end p-2">
            <button
              onClick={() => {
                setOpen(false);
                setQ("");
              }}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}


export default function DashboardPage() {
  const [node, setNode] = useState<NodeId>("master-worker");

  const metrics = METRICS_BY_NODE[node];

  const podsForNode = useMemo(
    () => PODS.filter((p) => p.node === node),
    [node]
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        {/* Metrics */}
        <section>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Key Metrics</h2>
              <p className="mt-1 text-sm text-zinc-600">
                Showing metrics for:{" "}
                <span className="font-medium text-zinc-900">
                  {NODES.find((n) => n.id === node)?.label}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <NodeSwitcher nodes={NODES} selected={node} onChange={setNode} />
              <button className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50">
                Refresh
              </button>
              <span className="hidden text-xs text-zinc-500 sm:inline">
                last updated: —
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((m) => (
              <MetricCard key={m.label} {...m} />
            ))}
          </div>
        </section>

        {/* Pods */}
        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Pods</h2>
              <p className="mt-1 text-sm text-zinc-600">
                Cards filtered to selected node.
              </p>
            </div>

            <div className="hidden items-center gap-3 text-xs text-zinc-600 sm:flex">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Running
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Pending
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Crashed
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {podsForNode.map((pod) => (
              <PodCard key={pod.id} pod={pod} />
            ))}

            {podsForNode.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-6 text-sm text-zinc-600">
                No pods found for this node (template state).
              </div>
            ) : null}
          </div>
        </section>

        <footer className="pt-2 text-xs text-zinc-500">
          Template footer text — replace with links, version info, build metadata.
        </footer>
      </main>
    </div>
  );
}
