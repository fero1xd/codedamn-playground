import { create } from "zustand";
import { combine } from "zustand/middleware";

type UseSelectedItem = {
  selectedFile: string | undefined;
  selectedDir: string | undefined;
};

export const useSelectedItem = create(
  combine(
    {
      selectedFile: undefined,
      selectedDir: undefined,
    } as UseSelectedItem,
    (set) => ({
      setSelectedDir: (dirPath: string) =>
        set({
          selectedDir: dirPath,
        }),
      setSelectedFile: (dirPath: string) =>
        set({
          selectedFile: dirPath,
        }),
    })
  )
);
