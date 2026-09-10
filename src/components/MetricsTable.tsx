import type { ProcessMetrics, SimulationResult } from '@/algorithms';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface MetricsTableProps {
  result: SimulationResult | null;
}

function formatTime(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function MetricsTable({ result }: MetricsTableProps) {
  if (!result || result.metrics.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavía no hay métricas para mostrar.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label="Espera promedio" value={result.summary.avgWaitingTime} />
        <StatTile label="Retorno promedio" value={result.summary.avgTurnaroundTime} />
        <StatTile label="Respuesta promedio" value={result.summary.avgResponseTime} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Espera</TableHead>
            <TableHead>Retorno</TableHead>
            <TableHead>Respuesta</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {result.metrics.map((metric: ProcessMetrics) => (
            <TableRow key={metric.processId}>
              <TableCell>{metric.processId}</TableCell>
              <TableCell>{formatTime(metric.waitingTime)}</TableCell>
              <TableCell>{formatTime(metric.turnaroundTime)}</TableCell>
              <TableCell>{formatTime(metric.responseTime)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

interface StatTileProps {
  label: string;
  value: number;
}

function StatTile({ label, value }: StatTileProps) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold text-foreground">{formatTime(value)}</p>
    </div>
  );
}
