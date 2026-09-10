import { buildSimulationResult } from './metrics';
import type { ExecutionSlice, MlfqLevelConfig, Process, SimulationResult } from './types';

// Regla de degradación: si un proceso agota su quantum sin terminar, baja un
// nivel (menos prioridad, quantum distinto). En el último nivel ya no baja más
// y sigue rotando ahí (Round Robin) hasta terminar. Las llegadas nuevas entran
// siempre al nivel 0 (máxima prioridad) y la CPU siempre atiende primero a la
// cola no vacía de mayor prioridad — sin expropiación a mitad de turno.
export function mlfq(processes: Process[], levels: MlfqLevelConfig[]): SimulationResult {
  const arrivalOrder = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const remainingBurst = new Map(processes.map((p) => [p.id, p.burstTime]));
  const queues: Process[][] = levels.map(() => []);
  const timeline: ExecutionSlice[] = [];

  let arrivalIndex = 0;
  let currentTime = arrivalOrder.length > 0 ? arrivalOrder[0].arrivalTime : 0;
  let pendingCount = processes.length;

  const enqueueArrivalsUpTo = (time: number) => {
    while (arrivalIndex < arrivalOrder.length && arrivalOrder[arrivalIndex].arrivalTime <= time) {
      queues[0].push(arrivalOrder[arrivalIndex]);
      arrivalIndex++;
    }
  };

  const nextNonEmptyLevel = () => queues.findIndex((queue) => queue.length > 0);

  enqueueArrivalsUpTo(currentTime);

  while (pendingCount > 0) {
    let levelIndex = nextNonEmptyLevel();

    if (levelIndex === -1) {
      currentTime = arrivalOrder[arrivalIndex].arrivalTime;
      enqueueArrivalsUpTo(currentTime);
      levelIndex = nextNonEmptyLevel();
    }

    const process = queues[levelIndex].shift()!;
    const quantum = levels[levelIndex].quantum;
    const remaining = remainingBurst.get(process.id)!;
    const runTime = Math.min(quantum, remaining);

    const start = currentTime;
    const end = start + runTime;
    timeline.push({ processId: process.id, start, end });
    currentTime = end;

    const newRemaining = remaining - runTime;
    remainingBurst.set(process.id, newRemaining);

    enqueueArrivalsUpTo(currentTime);

    if (newRemaining === 0) {
      pendingCount--;
    } else {
      const isLastLevel = levelIndex === levels.length - 1;
      const nextLevel = isLastLevel ? levelIndex : levelIndex + 1;
      queues[nextLevel].push(process);
    }
  }

  return buildSimulationResult(processes, timeline);
}
