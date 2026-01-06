import { Color } from "@/types";
import { fetchJson } from "@/lib/fetcher";

const getColors = async (): Promise<Color[]> => {
  try {
    return await fetchJson('/colors');
  } catch (err) {
    console.error('getColors error:', err);
    return [];
  }
}

export default getColors