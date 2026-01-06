import { Product } from "@/types";
import { fetchJson } from "@/lib/fetcher";

const getProduct = async ( id: string ): Promise<Product | null> => {
  try {
    return await fetchJson(`/products/${id}`);
  } catch (err) {
    console.error('getProduct error:', err);
    return null;
  }
};

export default getProduct;
