import createStoreHook from "zustand";
import { useEffect } from "react";
import { readFile as rf, writeFile as wf } from "fs";
import { promisify } from "util";
import path from "path";
import { taskMachine } from "./task-machine";
import { TaskMachineState } from "./types/interfaces";

const readFile = promisify(rf);
const writeFile = promisify(wf);

export const useTaskMachine = createStoreHook(taskMachine);

export function useBootFromSaveFile(saveFile: string): void {
  useEffect(() => {
    if (saveFile && path.extname(saveFile) === ".json") {
      readFile(saveFile, "utf8")
        .then((jsonFile) => {
          const initialState: TaskMachineState = JSON.parse(jsonFile);
          useTaskMachine.setState(initialState);
        })
        .catch(() => void 0); // DO NOTHING
    }
  }, [saveFile]);
}

export function useWriteToSaveFile(saveFile: string): void {
  useEffect(
    () =>
      useTaskMachine.subscribe((state) => {
        if (saveFile && path.extname(saveFile) === ".json") {
          const saveState: string = JSON.stringify(state);
          writeFile(saveFile, saveState);
        }
      }),
    [saveFile]
  );
}
