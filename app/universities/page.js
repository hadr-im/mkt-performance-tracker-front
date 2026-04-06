import UniversitiesClient from '../../components/UniversitiesClient';
import { fetchApi } from '../../lib/api';

export const dynamic = 'force-dynamic';

export default async function UniversitiesPage() {
  // Fetch initial data on the server for faster LCP
  let initialData = null;
  try {
    initialData = await fetchApi('/api/universities');
  } catch (error) {
    console.error("Failed to fetch initial universities data:", error);
  }

  return <UniversitiesClient initialData={initialData} />;
}
