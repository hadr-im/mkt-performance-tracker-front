import OverviewClient from '../components/OverviewClient';
import { fetchApi } from '../lib/api';

export const dynamic = 'force-dynamic';

export default async function OverviewPage() {
  // Fetch initial data on the server for faster LCP
  let initialData = null;
  try {
    initialData = await fetchApi('/api/overview');
  } catch (error) {
    console.error("Failed to fetch initial overview data:", error);
  }

  return <OverviewClient initialData={initialData} />;
}
