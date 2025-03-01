import { Table } from '@/components/game/table';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900">
      <Table />
      <Toaster position="top-center" />
    </main>
  );
} 