import create from "zustand/vanilla";

export enum MODE {
  NORMAL,
  INSERT,
}

export enum TASK_TYPE {
  DRAFT,
  ONGOING,
  FINISHED,
}

interface Key {
  return: boolean;
  escape: boolean;
}

interface Task {
  id: string;
  name: string;
  type: TASK_TYPE;
}

interface TaskMachineState {
  tasks: Task[];
  currentRow: number;
  currentCol: number;
  mode: MODE;
}

export const DEFAULT_TASK_MACHINE_STATE: TaskMachineState = {
  tasks: [],
  currentRow: 0,
  currentCol: -1,
  mode: MODE.NORMAL,
};

export const taskMachine = create((set, get) => ({
  ...DEFAULT_TASK_MACHINE_STATE,
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

          case input === "o":
            set(() => ({ mode: MODE.INSERT }));
            break;

          default:
            // NOOP
            break;
        }
        break;
      }

      case MODE.INSERT: {
        switch (true) {
          case key.escape:
            set(() => ({ mode: MODE.NORMAL }));
            break;
        }
        break;
      }

      default:
        // NOOP
        break;
    }
  },
}));
