import { buildSimulationResult } from './metrics';
import type { ExecutionSlice, Process, SimulationResult } from './types';

// FIFO (First Come, First Served): atiende a los procesos exactamente en el
// orden en que llegaron, sin importar cuánto dure cada uno. Simple, pero un
// proceso largo al frente hace esperar a todos los que llegaron después
// (efecto convoy).
export function fifo(processes: Process[]): SimulationResult {
  const arrivalOrder = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);

  let currentTime = 0;
  const timeline: ExecutionSlice[] = arrivalOrder.map((process) => {
    const start = Math.max(currentTime, process.arrivalTime);
    const end = start + process.burstTime;
    currentTime = end;
    return { processId: process.id, start, end };
  });

  return buildSimulationResult(processes, timeline);
}
