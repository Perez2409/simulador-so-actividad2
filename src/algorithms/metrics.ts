import type { ExecutionSlice, Process, ProcessMetrics, SimulationResult } from './types';

// waitingTime = turnaroundTime - burstTime es válido para cualquier algoritmo
// (preemptivo o no), porque no depende de cuántas veces fue interrumpido el proceso.
export function buildSimulationResult(processes: Process[], timeline: ExecutionSlice[]): SimulationResult {
  const firstStart = new Map<string, number>();
  const completionTime = new Map<string, number>();

  for (const slice of timeline) {
    if (!firstStart.has(slice.processId)) {
      firstStart.set(slice.processId, slice.start);
    }
    const currentEnd = completionTime.get(slice.processId) ?? Number.NEGATIVE_INFINITY;
    if (slice.end > currentEnd) {
      completionTime.set(slice.processId, slice.end);
    }
  }

  const metrics: ProcessMetrics[] = processes.map((process) => {
    const responseStart = firstStart.get(process.id) ?? process.arrivalTime;
    const finish = completionTime.get(process.id) ?? process.arrivalTime;
    const turnaroundTime = finish - process.arrivalTime;

    return {
      processId: process.id,
      waitingTime: turnaroundTime - process.burstTime,
      turnaroundTime,
      responseTime: responseStart - process.arrivalTime,
    };
  });

  return {
    timeline,
    metrics,
    summary: {
      avgWaitingTime: average(metrics.map((m) => m.waitingTime)),
      avgTurnaroundTime: average(metrics.map((m) => m.turnaroundTime)),
      avgResponseTime: average(metrics.map((m) => m.responseTime)),
    },
  };
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
