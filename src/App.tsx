import { useMemo, useState } from 'react';
import {
  fifo,
  mlfq,
  priority,
  roundRobin,
  sjf,
  type AlgorithmId,
  type Process,
  type SimulationResult,
} from '@/algorithms';
import { AlgorithmSelector } from '@/components/AlgorithmSelector';
import { GanttChart } from '@/components/GanttChart';
import { MetricsTable } from '@/components/MetricsTable';
import { ParametersPanel } from '@/components/ParametersPanel';
import { ProcessForm } from '@/components/ProcessForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DEFAULT_SIMULATION_PARAMS, type SimulationParams } from '@/types';

function runSimulation(
  algorithmId: AlgorithmId,
  processes: Process[],
  params: SimulationParams,
): SimulationResult | null {
  if (processes.length === 0) return null;

  switch (algorithmId) {
    case 'fifo':
      return fifo(processes);
    case 'sjf':
      return sjf(processes);
    case 'roundRobin':
      return roundRobin(processes, params.quantum);
    case 'priority':
      return priority(processes, params.preemptive);
    case 'mlfq':
      return mlfq(processes, params.mlfqLevels);
  }
}

function App() {
  const [algorithmId, setAlgorithmId] = useState<AlgorithmId>('fifo');
  const [processes, setProcesses] = useState<Process[]>([]);
  const [params, setParams] = useState<SimulationParams>(DEFAULT_SIMULATION_PARAMS);

  const showPriority = algorithmId === 'priority';

  // Se recalcula solo con cada cambio de algoritmo, proceso o parámetro,
  // para poder comparar algoritmos sin pasos extra.
  const result = useMemo(
    () => runSimulation(algorithmId, processes, params),
    [algorithmId, processes, params],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Simulador de Algoritmos de Planificación</h1>
        <p className="text-sm text-muted-foreground">
          Configurá los procesos y los parámetros, elegí un algoritmo y compará resultados.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Algoritmo</CardTitle>
        </CardHeader>
        <CardContent>
          <AlgorithmSelector value={algorithmId} onValueChange={setAlgorithmId} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-start">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Parámetros</CardTitle>
            </CardHeader>
            <CardContent>
              <ParametersPanel algorithmId={algorithmId} params={params} onParamsChange={setParams} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Procesos</CardTitle>
            </CardHeader>
            <CardContent>
              <ProcessForm processes={processes} onProcessesChange={setProcesses} showPriority={showPriority} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Diagrama de Gantt</CardTitle>
          </CardHeader>
          <CardContent>
            <GanttChart processes={processes} timeline={result?.timeline ?? []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricsTable result={result} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
