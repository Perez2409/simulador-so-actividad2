import { useRef, useState, type SubmitEvent } from 'react';
import type { Process } from '@/algorithms';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ProcessFormProps {
  processes: Process[];
  onProcessesChange: (processes: Process[]) => void;
  showPriority: boolean;
}

interface ProcessDraft {
  arrivalTime: string;
  burstTime: string;
  priority: string;
}

interface DraftErrors {
  arrivalTime?: string;
  burstTime?: string;
  priority?: string;
}

const EMPTY_DRAFT: ProcessDraft = { arrivalTime: '', burstTime: '', priority: '' };

function validateDraft(draft: ProcessDraft, requirePriority: boolean): DraftErrors {
  const errors: DraftErrors = {};
  const arrivalTime = Number(draft.arrivalTime);
  const burstTime = Number(draft.burstTime);

  if (draft.arrivalTime.trim() === '' || Number.isNaN(arrivalTime) || arrivalTime < 0) {
    errors.arrivalTime = 'Ingresá un tiempo de llegada válido (0 o mayor).';
  }

  if (draft.burstTime.trim() === '' || Number.isNaN(burstTime) || burstTime <= 0) {
    errors.burstTime = 'Ingresá un tiempo de ráfaga válido (mayor a 0).';
  }

  if (requirePriority) {
    const priority = Number(draft.priority);
    if (draft.priority.trim() === '' || Number.isNaN(priority)) {
      errors.priority = 'Ingresá una prioridad (número entero, 1 = más alta).';
    }
  }

  return errors;
}

export function ProcessForm({ processes, onProcessesChange, showPriority }: ProcessFormProps) {
  const [draft, setDraft] = useState<ProcessDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<DraftErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const nextIdRef = useRef(1);

  const resetDraft = () => {
    setDraft(EMPTY_DRAFT);
    setEditingId(null);
    setErrors({});
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateDraft(draft, showPriority);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const arrivalTime = Number(draft.arrivalTime);
    const burstTime = Number(draft.burstTime);
    const priority = showPriority ? Number(draft.priority) : undefined;

    if (editingId) {
      onProcessesChange(
        processes.map((process) =>
          process.id === editingId ? { ...process, arrivalTime, burstTime, priority } : process,
        ),
      );
    } else {
      const id = `P${nextIdRef.current++}`;
      onProcessesChange([...processes, { id, arrivalTime, burstTime, priority }]);
    }

    resetDraft();
  };

  const handleEdit = (process: Process) => {
    setEditingId(process.id);
    setErrors({});
    setDraft({
      arrivalTime: String(process.arrivalTime),
      burstTime: String(process.burstTime),
      priority: process.priority !== undefined ? String(process.priority) : '',
    });
  };

  const handleDelete = (id: string) => {
    onProcessesChange(processes.filter((process) => process.id !== id));
    if (editingId === id) resetDraft();
  };

  return (
    <div className="@container space-y-4">
      <ProcessTable processes={processes} showPriority={showPriority} onEdit={handleEdit} onDelete={handleDelete} />

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 @sm:grid-cols-4">
        <Field data-invalid={Boolean(errors.arrivalTime)}>
          <FieldLabel htmlFor="arrivalTime">Llegada</FieldLabel>
          <Input
            id="arrivalTime"
            type="number"
            step={1}
            aria-invalid={Boolean(errors.arrivalTime)}
            value={draft.arrivalTime}
            onChange={(event) => setDraft({ ...draft, arrivalTime: event.target.value })}
          />
          <FieldError>{errors.arrivalTime}</FieldError>
        </Field>

        <Field data-invalid={Boolean(errors.burstTime)}>
          <FieldLabel htmlFor="burstTime">Ráfaga</FieldLabel>
          <Input
            id="burstTime"
            type="number"
            step={1}
            aria-invalid={Boolean(errors.burstTime)}
            value={draft.burstTime}
            onChange={(event) => setDraft({ ...draft, burstTime: event.target.value })}
          />
          <FieldError>{errors.burstTime}</FieldError>
        </Field>

        {showPriority && (
          <Field data-invalid={Boolean(errors.priority)}>
            <FieldLabel htmlFor="priority">Prioridad</FieldLabel>
            <Input
              id="priority"
              type="number"
              step={1}
              aria-invalid={Boolean(errors.priority)}
              value={draft.priority}
              onChange={(event) => setDraft({ ...draft, priority: event.target.value })}
            />
            <FieldError>{errors.priority}</FieldError>
          </Field>
        )}

        <div className="flex items-end gap-2">
          <Button type="submit">{editingId ? 'Guardar cambios' : 'Agregar proceso'}</Button>
          {editingId && (
            <Button type="button" variant="ghost" onClick={resetDraft}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

interface ProcessTableProps {
  processes: Process[];
  showPriority: boolean;
  onEdit: (process: Process) => void;
  onDelete: (id: string) => void;
}

function ProcessTable({ processes, showPriority, onEdit, onDelete }: ProcessTableProps) {
  if (processes.length === 0) {
    return <p className="text-sm text-muted-foreground">Agregá al menos un proceso para poder simular.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Llegada</TableHead>
          <TableHead>Ráfaga</TableHead>
          {showPriority && <TableHead>Prioridad</TableHead>}
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {processes.map((process) => (
          <TableRow key={process.id}>
            <TableCell>{process.id}</TableCell>
            <TableCell>{process.arrivalTime}</TableCell>
            <TableCell>{process.burstTime}</TableCell>
            {showPriority && <TableCell>{process.priority ?? '—'}</TableCell>}
            <TableCell className="text-right">
              <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(process)}>
                Editar
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => onDelete(process.id)}>
                Eliminar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
