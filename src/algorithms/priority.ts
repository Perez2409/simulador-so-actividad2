import { buildSimulationResult } from './metrics';
import type { ExecutionSlice, Process, SimulationResult } from './types';

// Convención: menor valor numérico de priority = mayor prioridad.
function priorityValue(process: Process): number {
  return process.priority ?? Number.POSITIVE_INFINITY;
}

function pickHighestPriority(ready: Process[]): Process {
  return ready.reduce((best, candidate) => (priorityValue(candidate) < priorityValue(best) ? candidate : best));
}

// Prioridad: siempre elige atender al proceso listo con mejor prioridad
// (menor número = más prioritario). En modo preemptivo, un proceso que llega
// con mejor prioridad interrumpe al que está en CPU; en modo no preemptivo,
// espera a que termine su turno actual.
export function priority(processes: Process[], preemptive: boolean): SimulationResult {
  const arrivalOrder = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const remainingBurst = new Map(processes.map((p) => [p.id, p.burstTime]));
  const completed = new Set<string>();
  const timeline: ExecutionSlice[] = [];

  let currentTime = arrivalOrder.length > 0 ? arrivalOrder[0].arrivalTime : 0;

  const readyAt = (time: number) =>
    arrivalOrder.filter((process) => process.arrivalTime <= time && !completed.has(process.id));

  while (completed.size < processes.length) {
    let ready = readyAt(currentTime);

    if (ready.length === 0) {
      currentTime = arrivalOrder.find((process) => !completed.has(process.id))!.arrivalTime;
      ready = readyAt(currentTime);
    }

    const current = pickHighestPriority(ready);
    const remaining = remainingBurst.get(current.id)!;
    const naturalEnd = currentTime + remaining;

    let end = naturalEnd;

    if (preemptive) {
      const preemptingArrival = arrivalOrder.find(
        (candidate) =>
          candidate.arrivalTime > currentTime &&
          candidate.arrivalTime < naturalEnd &&
          !completed.has(candidate.id) &&
          priorityValue(candidate) < priorityValue(current),
      );
      if (preemptingArrival) {
        end = preemptingArrival.arrivalTime;
      }
    }

    const start = currentTime;
    timeline.push({ processId: current.id, start, end });
    currentTime = end;

    const ran = end - start;
    const newRemaining = remaining - ran;
    remainingBurst.set(current.id, newRemaining);

    if (newRemaining === 0) {
      completed.add(current.id);
    }
  }

  return buildSimulationResult(processes, timeline);
}
