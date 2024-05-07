import { Playground } from "@/lib/types";
import { API_URL } from "@/lib/utils";

export const getAllPlaygrounds = async () => {
  const res = await fetch(`${API_URL}/playgrounds`);
  if (!res.ok) {
    throw new Error("Query failed");
  }

  const json = await res.json();
  if (!json.message) {
    throw new Error("Invalid api response");
  }

  return json.message as Playground[];
};
