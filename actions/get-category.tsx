import { Category } from "@/types";
import { fetchJson } from "@/lib/fetcher";

const getCategory = async ( id: string ): Promise<Category | null> => {
  try {
    return await fetchJson(`/categories/${id}`);
  } catch (err) {
    console.error('getCategory error:', err);
    return null;
  }
};

export default getCategory;
