import { buildSimulationResult } from './metrics';
import type { ExecutionSlice, Process, SimulationResult } from './types';

// SJF (Shortest Job First), no expropiativo: cuando la CPU queda libre, elige
// entre los procesos ya listos al que menos tiempo de ráfaga necesita. Una
// vez que empieza, lo corre hasta terminar sin interrumpirlo.
export function sjf(processes: Process[]): SimulationResult {
  const arrivalOrder = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const pending = [...arrivalOrder];
  const timeline: ExecutionSlice[] = [];

  let currentTime = pending.length > 0 ? pending[0].arrivalTime : 0;

  while (pending.length > 0) {
    const ready = pending.filter((process) => process.arrivalTime <= currentTime);

    if (ready.length === 0) {
      currentTime = pending[0].arrivalTime;
      continue;
    }

    const next = ready.reduce((shortest, candidate) =>
      candidate.burstTime < shortest.burstTime ? candidate : shortest,
    );

    const start = currentTime;
    const end = start + next.burstTime;
    timeline.push({ processId: next.id, start, end });
    currentTime = end;

    pending.splice(pending.indexOf(next), 1);
  }

  return buildSimulationResult(processes, timeline);
}
