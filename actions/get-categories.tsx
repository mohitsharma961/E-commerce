import { Category } from "@/types";
import { fetchJson } from "@/lib/fetcher";

const getCategories = async (): Promise<Category[]> => {
  try {
    return await fetchJson('/categories');
  } catch (err) {
    console.error('getCategories error:', err);
    return [];
  }
}

export default getCategories