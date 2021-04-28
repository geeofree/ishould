import { nanoid } from "nanoid";
import createStoreHook from "zustand";
import create from "zustand/vanilla";
import { MODE, TASK_TYPE } from "./types/enums";
import { Task, TaskMachineState } from "./types/interfaces";
import { insertAtIndex, removeAtIndex } from "./utils";
import { Key } from "ink";

export function createTask(taskType: TASK_TYPE, taskName = ""): Task {
  return {
    id: nanoid(),
    name: taskName,
    type: taskType,
  };
}

export const DEFAULT_TASK_MACHINE_STATE: TaskMachineState = {
  origDraftOngoingTaskName: null,
  tasks: [],
  currentRow: -1,
  currentCol: -1,
  mode: MODE.NORMAL,
};

interface TaskMachineStateMethods {
  getCurrentTask: () => Task;
  transition: (input: string, key: Key) => void;
}

export const taskMachine = create<TaskMachineState & TaskMachineStateMethods>(
  (set, get) => ({
    ...DEFAULT_TASK_MACHINE_STATE,

    getCurrentTask(): Task {
      const { tasks, currentRow } = get();
      return tasks[currentRow];
    },

    transition(input: string, key: Key): void {
      switch (get().mode) {
        case MODE.NORMAL: {
          switch (true) {
            case input === "j":
              set((state) => ({
                currentRow: (state.currentRow + 1) % state.tasks.length,
              }));
              break;

            case input === "k":
              set((state) => {
                const prevRow = state.currentRow - 1;
                return {
                  currentRow: prevRow < 0 ? state.tasks.length - 1 : prevRow,
                };
              });
              break;

            case input === "i":
              set((state) => ({
                mode: MODE.INSERT,
                currentRow: state.currentRow + 1,
                currentCol: 0,
                tasks: insertAtIndex(
                  state.tasks,
                  state.currentRow + 1,
                  createTask(TASK_TYPE.DRAFT)
                ),
              }));
              break;

            case input === "u":
              set((state) => {
                const currentTask = state.getCurrentTask();

                if (
                  state.tasks.length === 0 ||
                  currentTask.type === TASK_TYPE.FINISHED
                ) {
                  return state;
                }

                const newTasks = insertAtIndex(
                  state.tasks,
                  state.currentRow,
                  { ...currentTask, type: TASK_TYPE.DRAFT_ONGOING },
                  true
                );

                return {
                  mode: MODE.INSERT,
                  tasks: newTasks,
                  origDraftOngoingTaskName: currentTask.name,
                  currentCol: currentTask.name.length,
                };
              });
              break;

            case input === "D":
              set((state) => {
                if (state.tasks.length === 0) {
                  return state;
                }

                return {
                  tasks: removeAtIndex(state.tasks, state.currentRow),
                  currentRow:
                    state.currentRow === state.tasks.length - 1
                      ? state.currentRow - 1
                      : state.currentRow,
                };
              });
              break;

            case input === " ":
              set((state) => {
                const currentTask = state.getCurrentTask();

                return {
                  tasks: insertAtIndex(
                    state.tasks,
                    state.currentRow,
                    {
                      ...currentTask,
                      type:
                        currentTask.type === TASK_TYPE.ONGOING
                          ? TASK_TYPE.FINISHED
                          : TASK_TYPE.ONGOING,
                    },
                    true
                  ),
                };
              });
              break;

            default:
              // NOOP
              break;
          }
          break;
        }

        case MODE.INSERT: {
          switch (true) {
            case key?.escape:
              set((state) => {
                const currentTask = state.getCurrentTask();

                let nextCurrentRow: number;
                let nextTasks: Task[];

                switch (currentTask.type) {
                  case TASK_TYPE.DRAFT:
                    nextCurrentRow = state.currentRow - 1;
                    nextTasks = removeAtIndex(state.tasks, state.currentRow);
                    break;

                  case TASK_TYPE.DRAFT_ONGOING:
                    nextCurrentRow = state.currentRow;
                    nextTasks = insertAtIndex(
                      state.tasks,
                      state.currentRow,
                      {
                        ...currentTask,
                        type: TASK_TYPE.ONGOING,
                        name: state.origDraftOngoingTaskName,
                      },
                      true
                    );
                    break;

                  default:
                    // no-op
                    break;
                }

                return {
                  origDraftOngoingTaskName:
                    DEFAULT_TASK_MACHINE_STATE.origDraftOngoingTaskName,
                  mode: MODE.NORMAL,
                  currentRow: nextCurrentRow,
                  tasks: nextTasks,
                };
              });
              break;

            case key?.ctrl && input === "o":
              set((state) => {
                const draftTask = state.tasks[state.currentRow];

                if (!draftTask.name) {
                  return state;
                }

                const newTasks = insertAtIndex(
                  state.tasks,
                  state.currentRow,
                  createTask(TASK_TYPE.ONGOING, draftTask.name)
                );

                const nextCurrentRow = state.currentRow + 1;
                newTasks[nextCurrentRow].name = "";

                return {
                  tasks: newTasks,
                  currentCol: 0,
                  currentRow: nextCurrentRow,
                };
              });
              break;

            case key?.return:
              set((state) => {
                const draftTask = state.tasks[state.currentRow];

                if (!draftTask.name) {
                  return state;
                }

                const newTasks = insertAtIndex(
                  state.tasks,
                  state.currentRow,
                  createTask(TASK_TYPE.ONGOING, draftTask.name),
                  true
                );

                return {
                  mode: MODE.NORMAL,
                  tasks: newTasks,
                };
              });
              break;

            case key?.leftArrow:
              set((state) => ({
                currentCol: Math.max(state.currentCol - 1, 0),
              }));
              break;

            case key?.rightArrow:
              set((state) => ({
                currentCol: Math.min(
                  state.currentCol + 1,
                  state.getCurrentTask().name.length
                ),
              }));
              break;

            case key?.delete:
              set((state) => {
                const currentTask = state.getCurrentTask();

                const nextCurrentCol = Math.max(state.currentCol - 1, 0);

                const nextDraftTaskName = removeAtIndex(
                  currentTask.name.split(""),
                  nextCurrentCol
                ).join("");

                const nexTasks = insertAtIndex(
                  state.tasks,
                  state.currentRow,
                  { ...currentTask, name: nextDraftTaskName },
                  true
                );

                return {
                  tasks: nexTasks,
                  currentCol: nextCurrentCol,
                };
              });
              break;

            default:
              set((state) => {
                const draftTask = state.getCurrentTask();

                const newDraftTaskName = insertAtIndex(
                  draftTask.name.split(""),
                  state.currentCol,
                  input
                ).join("");

                const newTasks = insertAtIndex(
                  state.tasks,
                  state.currentRow,
                  {
                    ...draftTask,
                    name: newDraftTaskName,
                  },
                  true
                );

                return {
                  tasks: newTasks,
                  currentCol: state.currentCol + input.length,
                };
              });
              break;
          }
          break;
        }

        default:
          // NOOP
          break;
      }
    },
  })
);

export const useTaskMachine = createStoreHook(taskMachine);
