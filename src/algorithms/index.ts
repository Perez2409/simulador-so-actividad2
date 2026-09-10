export { fifo } from './fifo';
export { mlfq } from './mlfq';
export { priority } from './priority';
export { roundRobin } from './roundRobin';
export { sjf } from './sjf';
export type { ExecutionSlice, MlfqLevelConfig, Process, ProcessMetrics, SimulationResult } from './types';

export type AlgorithmId = 'fifo' | 'sjf' | 'roundRobin' | 'priority' | 'mlfq';

export interface AlgorithmDefinition {
  id: AlgorithmId;
  label: string;
  description: string;
}

export const ALGORITHMS: AlgorithmDefinition[] = [
  { id: 'fifo', label: 'FIFO', description: 'First Come, First Serve' },
  { id: 'sjf', label: 'SJF', description: 'Shortest Job First (no expropiativo)' },
  { id: 'roundRobin', label: 'Round Robin', description: 'Turnos de duración fija (quantum)' },
  { id: 'priority', label: 'Prioridad', description: 'Preemptiva o no preemptiva' },
  { id: 'mlfq', label: 'MLFQ', description: 'Cola multinivel con retroalimentación' },
];
