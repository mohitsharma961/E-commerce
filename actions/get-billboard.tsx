import { Billboard } from "@/types";
import { fetchJson } from "@/lib/fetcher";

const getBillboard = async ( id: string ): Promise<Billboard | null> => {
  try {
    return await fetchJson(`/billboards/${id}`);
  } catch (err) {
    console.error('getBillboard error:', err);
    return null;
  }
};

export default getBillboard;
