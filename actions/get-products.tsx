import { Product } from "@/types";
import qs from 'query-string'
import { fetchJson } from "@/lib/fetcher";

interface Query {
  categoryId?: string;
  colorId?: string;
  sizeId?: string;
  description?: string;
  isFeatured?: boolean;
}

const getProducts = async (query: Query): Promise<Product[]> => {
  try {
    const queryString = qs.stringify({
      description: query.description,
      colorId: query.colorId,
      sizeId: query.sizeId,
      categoryId: query.categoryId,
      isFeatured: query.isFeatured
    }, { skipEmptyString: true, skipNull: true });

    const path = `/products${queryString ? `?${queryString}` : ''}`;

    return await fetchJson(path);
  } catch (err) {
    console.error('getProducts error:', err);
    return [];
  }
};

export default getProducts;
