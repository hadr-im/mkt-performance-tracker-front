import ProductsClient from '../../components/ProductsClient';
import { fetchApi } from '../../lib/api';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  // Fetch initial data on the server for faster LCP
  let initialData = null;
  try {
    initialData = await fetchApi('/api/products');
  } catch (error) {
    console.error("Failed to fetch initial products data:", error);
  }

  return <ProductsClient initialData={initialData} />;
}
