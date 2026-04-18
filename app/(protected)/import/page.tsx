import { ImportCsvPanel } from '@/components/import-csv-panel';

export default function ImportPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Importar extrato CSV</h1>
      <ImportCsvPanel />
    </div>
  );
}
