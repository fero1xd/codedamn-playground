import { Playground } from "@/lib/types";

const backendUrl = "http://localhost:3000";

export const getAllPlaygrounds = async () => {
  const res = await fetch(`${backendUrl}/playgrounds`);
  if (!res.ok) {
    throw new Error("Query failed");
  }

  const json = await res.json();
  if (!json.message) {
    throw new Error("Invalid api response");
  }

  return json.message as Playground[];
};
