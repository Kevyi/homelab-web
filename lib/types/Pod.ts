export type PodStatus = "Running" | "Pending" | "Crashed" | "Stopped";

export interface Pod {
  id: string;
  name: string;
  namespace?: string;
  status: PodStatus;
  cpu?: string;
  memory?: string;
  restarts?: number;
  node?: string;
  updatedAt?: string;
}