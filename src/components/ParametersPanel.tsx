import { useState } from 'react';
import type { AlgorithmId } from '@/algorithms';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { SimulationParams } from '@/types';

interface ParametersPanelProps {
  algorithmId: AlgorithmId;
  params: SimulationParams;
  onParamsChange: (params: SimulationParams) => void;
}

export function ParametersPanel({ algorithmId, params, onParamsChange }: ParametersPanelProps) {
  if (algorithmId === 'fifo' || algorithmId === 'sjf') {
    return <p className="text-sm text-muted-foreground">Este algoritmo no tiene parámetros adicionales.</p>;
  }

  if (algorithmId === 'roundRobin') {
    return (
      <Field>
        <FieldLabel htmlFor="quantum">Quantum</FieldLabel>
        <PositiveIntegerInput
          id="quantum"
          value={params.quantum}
          onCommit={(quantum) => onParamsChange({ ...params, quantum })}
        />
        <FieldDescription>Duración fija de cada turno de CPU, en unidades de tiempo (mínimo 1).</FieldDescription>
      </Field>
    );
  }

  if (algorithmId === 'priority') {
    return (
      <Field orientation="horizontal">
        <FieldLabel htmlFor="preemptive">Modo preemptivo</FieldLabel>
        <Switch
          id="preemptive"
          checked={params.preemptive}
          onCheckedChange={(checked) => onParamsChange({ ...params, preemptive: checked })}
        />
        <FieldDescription>
          Con el modo activo, un proceso que llega con mayor prioridad interrumpe al que está en CPU.
        </FieldDescription>
      </Field>
    );
  }

  return <MlfqLevelsField params={params} onParamsChange={onParamsChange} />;
}

function MlfqLevelsField({ params, onParamsChange }: Omit<ParametersPanelProps, 'algorithmId'>) {
  const levels = params.mlfqLevels;

  const updateLevel = (index: number, quantum: number) => {
    onParamsChange({
      ...params,
      mlfqLevels: levels.map((level, i) => (i === index ? { quantum } : level)),
    });
  };

  const addLevel = () => {
    onParamsChange({ ...params, mlfqLevels: [...levels, { quantum: 4 }] });
  };

  const removeLevel = (index: number) => {
    onParamsChange({ ...params, mlfqLevels: levels.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      {levels.map((level, index) => (
        <Field key={index} orientation="horizontal">
          <FieldLabel htmlFor={`mlfq-level-${index}`}>Nivel {index + 1}</FieldLabel>
          <PositiveIntegerInput
            id={`mlfq-level-${index}`}
            value={level.quantum}
            onCommit={(quantum) => updateLevel(index, quantum)}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeLevel(index)}
            disabled={levels.length <= 1}
          >
            Quitar
          </Button>
        </Field>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addLevel}>
        Agregar nivel
      </Button>
      <FieldDescription>
        Si un proceso agota el quantum de un nivel sin terminar, baja al siguiente. En el último nivel deja
        de bajar y sigue rotando ahí. El quantum mínimo es 1.
      </FieldDescription>
    </div>
  );
}

interface PositiveIntegerInputProps {
  id: string;
  value: number;
  onCommit: (value: number) => void;
}

// Deja escribir libremente (incluso vacío o momentáneamente inválido) y solo
// confirma un entero >= 1 al perder el foco. Sin esto, un quantum en 0 deja a
// roundRobin/mlfq en loop infinito: el proceso nunca reduce su ráfaga restante.
function PositiveIntegerInput({ id, value, onCommit }: PositiveIntegerInputProps) {
  const [draft, setDraft] = useState(String(value));

  // Sincroniza el borrador si `value` cambia desde afuera (ej. se elimina un
  // nivel de MLFQ y este input pasa a representar otro nivel). Ajustar el
  // estado durante el render, no en un efecto, evita un commit extra.
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setDraft(String(value));
  }

  const commit = () => {
    const sanitized = toPositiveInt(draft);
    setDraft(String(sanitized));
    if (sanitized !== value) onCommit(sanitized);
  };

  return (
    <Input
      id={id}
      type="number"
      min={1}
      step={1}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
    />
  );
}

function toPositiveInt(value: string): number {
  const parsed = Math.floor(Number(value));
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}
