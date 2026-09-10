import type { MlfqLevelConfig } from '@/algorithms';

// Parámetros de simulación de los 3 algoritmos que los necesitan.
// Vive separado de algorithms/types.ts porque describe estado de la UI,
// no el modelo de dominio de la planificación.
export interface SimulationParams {
  quantum: number;
  preemptive: boolean;
  mlfqLevels: MlfqLevelConfig[];
}

export const DEFAULT_SIMULATION_PARAMS: SimulationParams = {
  quantum: 2,
  preemptive: false,
  mlfqLevels: [{ quantum: 2 }, { quantum: 4 }, { quantum: 8 }],
};
