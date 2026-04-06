import DepartmentsClient from '../../components/DepartmentsClient';
import { fetchApi } from '../../lib/api';

export const dynamic = 'force-dynamic';

export default async function DepartmentsPage() {
  // Fetch initial data on the server for faster LCP
  let initialData = null;
  try {
    initialData = await fetchApi('/api/departments');
  } catch (error) {
    console.error("Failed to fetch initial departments data:", error);
  }

  return <DepartmentsClient initialData={initialData} />;
}
