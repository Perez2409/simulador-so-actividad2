import { buildSimulationResult } from './metrics';
import type { ExecutionSlice, Process, SimulationResult } from './types';

// Round Robin: le da a cada proceso un turno de duración fija (quantum). Si
// no termina en ese turno, vuelve al final de la cola y sigue el próximo.
// Reparte la CPU parejo entre todos, a costa de más cambios de proceso.
export function roundRobin(processes: Process[], quantum: number): SimulationResult {
  const arrivalOrder = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const remainingBurst = new Map(processes.map((p) => [p.id, p.burstTime]));
  const timeline: ExecutionSlice[] = [];
  const queue: Process[] = [];

  let arrivalIndex = 0;
  let currentTime = arrivalOrder.length > 0 ? arrivalOrder[0].arrivalTime : 0;

  const enqueueArrivalsUpTo = (time: number) => {
    while (arrivalIndex < arrivalOrder.length && arrivalOrder[arrivalIndex].arrivalTime <= time) {
      queue.push(arrivalOrder[arrivalIndex]);
      arrivalIndex++;
    }
  };

  enqueueArrivalsUpTo(currentTime);

  while (queue.length > 0 || arrivalIndex < arrivalOrder.length) {
    if (queue.length === 0) {
      currentTime = arrivalOrder[arrivalIndex].arrivalTime;
      enqueueArrivalsUpTo(currentTime);
    }

    const process = queue.shift()!;
    const remaining = remainingBurst.get(process.id)!;
    const runTime = Math.min(quantum, remaining);

    const start = currentTime;
    const end = start + runTime;
    timeline.push({ processId: process.id, start, end });
    currentTime = end;
    remainingBurst.set(process.id, remaining - runTime);

    // Los procesos que llegan durante este turno entran a la cola antes que
    // el proceso recién expropiado, para no dejarlos esperando de más.
    enqueueArrivalsUpTo(currentTime);

    if (remainingBurst.get(process.id)! > 0) {
      queue.push(process);
    }
  }

  return buildSimulationResult(processes, timeline);
}
