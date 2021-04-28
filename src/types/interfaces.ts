import { State } from "zustand";
import { TASK_TYPE, MODE } from "./enums";

export interface Task {
  id: string;
  name: string;
  type: TASK_TYPE;
}

export interface TaskMachineState extends State {
  origDraftOngoingTaskName: string | null;
  tasks: Task[];
  currentRow: number;
  currentCol: number;
  mode: MODE;
}
