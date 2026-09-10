export interface Process {
  id: string;
  arrivalTime: number;
  burstTime: number;
  priority?: number; // usado por Prioridad y MLFQ (menor número = mayor prioridad)
}

export interface ExecutionSlice {
  processId: string;
  start: number;
  end: number;
}

export interface ProcessMetrics {
  processId: string;
  waitingTime: number;
  turnaroundTime: number;
  responseTime: number;
}

export interface SimulationResult {
  timeline: ExecutionSlice[];
  metrics: ProcessMetrics[];
  summary: {
    avgWaitingTime: number;
    avgTurnaroundTime: number;
    avgResponseTime: number;
  };
}

export interface MlfqLevelConfig {
  quantum: number; // duración del turno en este nivel
}
