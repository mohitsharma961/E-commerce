import { Size } from "@/types";
import { fetchJson } from "@/lib/fetcher";

const getSizes = async (): Promise<Size[]> => {
  try {
    return await fetchJson('/sizes');
  } catch (err) {
    console.error('getSizes error:', err);
    return [];
  }
}

export default getSizes