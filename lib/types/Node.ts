export type NodeId = "master-worker" | "worker";

export type NodeInfo = {
  id: NodeId;
  label: string;
  subtitle: string;
};