import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ExecutionSlice, Process } from '@/algorithms';

// Paleta categórica validada (ver dataviz skill): 8 tonos, orden fijo, nunca ciclada
// a propósito. Si algún día hay más de 8 procesos, se repite (limitación aceptada
// para este proyecto chico).
const SERIES_COLORS = [
  '#2a78d6',
  '#eb6834',
  '#1baf7a',
  '#eda100',
  '#e87ba4',
  '#008300',
  '#4a3aa7',
  '#e34948',
];

const CHART_SURFACE = '#fcfcfb';
const AXIS_COLOR = '#c3c2b7';
const TICK_COLOR = '#898781';
const CATEGORY_TICK_COLOR = '#0b0b0b';

function colorForRow(index: number): string {
  return SERIES_COLORS[index % SERIES_COLORS.length];
}

const NICE_TICK_STEPS = [1, 2, 5, 10, 15, 20, 25, 50, 100, 200, 500];
const MAX_X_TICKS = 15;

// Elige un paso "redondo" (1, 2, 5, 10, 20...) para que el eje X nunca muestre
// más de MAX_X_TICKS marcas, sin importar qué tan largo sea el timeline.
function buildXTicks(maxTime: number): number[] {
  if (maxTime <= 0) return [0];

  const rawStep = maxTime / MAX_X_TICKS;
  const step = NICE_TICK_STEPS.find((candidate) => candidate >= rawStep) ?? Math.ceil(rawStep / 100) * 100;

  const ticks: number[] = [];
  for (let t = 0; t <= maxTime; t += step) ticks.push(t);
  if (ticks[ticks.length - 1] !== maxTime) ticks.push(maxTime);
  return ticks;
}

interface GanttChartProps {
  processes: Process[];
  timeline: ExecutionSlice[];
}

interface GanttRow {
  processId: string;
  [segmentKey: string]: string | number;
}

interface GanttData {
  rows: GanttRow[];
  maxSegments: number;
  maxTime: number;
}

// El Gantt se arma como una barra apilada por proceso: cada segmento real
// (ExecutionSlice) va precedido de una barra "gap" invisible que empuja el
// segmento hasta su tiempo de inicio real. Así se ven expropiaciones y
// migraciones de nivel tal cual ocurrieron, sin simplificar el timeline.
function buildGanttData(processes: Process[], timeline: ExecutionSlice[]): GanttData {
  const slicesByProcess = new Map<string, ExecutionSlice[]>();
  for (const slice of timeline) {
    const list = slicesByProcess.get(slice.processId) ?? [];
    list.push(slice);
    slicesByProcess.set(slice.processId, list);
  }
  for (const slices of slicesByProcess.values()) {
    slices.sort((a, b) => a.start - b.start);
  }

  const maxSegments = Math.max(1, ...processes.map((p) => slicesByProcess.get(p.id)?.length ?? 0));
  const maxTime = timeline.reduce((max, slice) => Math.max(max, slice.end), 0);

  const rows: GanttRow[] = processes.map((process) => {
    const slices = slicesByProcess.get(process.id) ?? [];
    const row: GanttRow = { processId: process.id };
    let cursor = 0;
    for (let i = 0; i < maxSegments; i++) {
      const slice = slices[i];
      row[`gap${i}`] = slice ? slice.start - cursor : 0;
      row[`seg${i}`] = slice ? slice.end - slice.start : 0;
      if (slice) cursor = slice.end;
    }
    return row;
  });

  return { rows, maxSegments, maxTime };
}

interface GanttTooltipProps {
  active?: boolean;
  label?: string;
  timeline: ExecutionSlice[];
}

interface SegmentLabelProps {
  x?: string | number;
  y?: string | number;
  width?: string | number;
  height?: string | number;
  value?: string | number | boolean | null;
}

// Muestra la duración dentro de cada segmento, pero solo si hay espacio real
// para el texto — evita amontonar números en segmentos muy angostos.
function SegmentLabel({ x, y, width, height, value }: SegmentLabelProps) {
  const numWidth = Number(width);
  const numValue = Number(value);
  if (!numValue || x === undefined || y === undefined || !Number.isFinite(numWidth)) return null;
  if (numWidth < 18) return null;

  return (
    <text
      x={Number(x) + numWidth / 2}
      y={Number(y) + Number(height) / 2}
      textAnchor="middle"
      dominantBaseline="central"
      fill="#fff"
      fontSize={11}
      fontWeight={600}
    >
      {numValue}
    </text>
  );
}

function GanttTooltip({ active, label, timeline }: GanttTooltipProps) {
  if (!active || !label) return null;
  const slices = timeline.filter((slice) => slice.processId === label).sort((a, b) => a.start - b.start);

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      <p className="font-medium">{label}</p>
      <ul className="mt-1 space-y-0.5">
        {slices.map((slice) => (
          <li key={slice.start} className="text-muted-foreground">
            {slice.start}–{slice.end}{' '}
            <span className="text-foreground">({slice.end - slice.start} u.)</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GanttChart({ processes, timeline }: GanttChartProps) {
  if (processes.length === 0 || timeline.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavía no hay una simulación para mostrar.</p>;
  }

  const { rows, maxSegments, maxTime } = buildGanttData(processes, timeline);
  const chartHeight = Math.max(160, rows.length * 44 + 40);
  const xTicks = buildXTicks(maxTime);

  return (
    <div style={{ width: '100%', height: chartHeight }}>
      <ResponsiveContainer>
        <BarChart data={rows} layout="vertical" barSize={20} margin={{ top: 4, right: 16, bottom: 20, left: 0 }}>
          <XAxis
            type="number"
            domain={[0, maxTime]}
            allowDecimals={false}
            ticks={xTicks}
            interval={0}
            tickLine={false}
            axisLine={{ stroke: AXIS_COLOR }}
            tick={{ fill: TICK_COLOR, fontSize: 12 }}
            label={{ value: 'Tiempo (unidades)', position: 'insideBottom', offset: -14, fill: TICK_COLOR, fontSize: 11 }}
          />
          <YAxis
            type="category"
            dataKey="processId"
            tickLine={false}
            axisLine={{ stroke: AXIS_COLOR }}
            tick={{ fill: CATEGORY_TICK_COLOR, fontSize: 12 }}
            width={40}
          />
          <Tooltip
            content={(props) => <GanttTooltip active={props.active} label={props.label as string} timeline={timeline} />}
            cursor={{ fill: 'rgba(11,11,11,0.04)' }}
          />
          {Array.from({ length: maxSegments }).flatMap((_, segmentIndex) => [
            <Bar
              key={`gap${segmentIndex}`}
              dataKey={`gap${segmentIndex}`}
              stackId="gantt"
              fill="transparent"
              isAnimationActive={false}
            />,
            <Bar
              key={`seg${segmentIndex}`}
              dataKey={`seg${segmentIndex}`}
              stackId="gantt"
              stroke={CHART_SURFACE}
              strokeWidth={2}
              radius={3}
              isAnimationActive={false}
            >
              {rows.map((row, rowIndex) => (
                <Cell key={row.processId} fill={colorForRow(rowIndex)} />
              ))}
              <LabelList dataKey={`seg${segmentIndex}`} content={SegmentLabel} />
            </Bar>,
          ])}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
