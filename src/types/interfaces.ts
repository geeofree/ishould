import { State } from "zustand";
import { TASK_TYPE, MODE } from "./enums";

export interface Key {
  return: boolean;
  escape: boolean;
  shift: boolean;
}

export interface Task {
  id: string;
  name: string;
  type: TASK_TYPE;
}

export interface TaskMachineState extends State {
  tasks: Task[];
  currentRow: number;
  currentCol: number;
  mode: MODE;
}
