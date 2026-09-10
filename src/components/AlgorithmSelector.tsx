import { ALGORITHMS, type AlgorithmId } from '@/algorithms';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AlgorithmSelectorProps {
  value: AlgorithmId;
  onValueChange: (value: AlgorithmId) => void;
}

export function AlgorithmSelector({ value, onValueChange }: AlgorithmSelectorProps) {
  return (
    <Tabs value={value} onValueChange={(next) => onValueChange(next as AlgorithmId)}>
      <TabsList className="w-full justify-start overflow-x-auto overflow-y-hidden">
        {ALGORITHMS.map((algorithm) => (
          <TabsTrigger key={algorithm.id} value={algorithm.id} className="min-w-fit">
            {algorithm.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
