import {
  taskMachine,
  DEFAULT_TASK_MACHINE_STATE,
  MODE,
} from "../src/task-machine";

describe("Task Machine", () => {
  afterEach(() => {
    taskMachine.setState(DEFAULT_TASK_MACHINE_STATE);
  });

  it("Should be able to cycle forwards on the row when in NORMAL mode using 'j'", () => {
    const { setState, getState } = taskMachine;
    const { transition } = getState();

    const tasks = Array(5);
    setState({ tasks });

    expect(getState().mode).toBe(MODE.NORMAL);
    expect(getState().currentRow).toBe(0);
    transition("j");
    expect(getState().currentRow).toBe(1);
    transition("j");
    expect(getState().currentRow).toBe(2);
    transition("j");
    expect(getState().currentRow).toBe(3);
    transition("j");
    expect(getState().currentRow).toBe(4);
    transition("j");
    expect(getState().currentRow).toBe(0);
  });

  it("Should be able to cycle backwards on the row when in NORMAL mode using 'k'", () => {
    const { setState, getState } = taskMachine;
    const { transition } = getState();

    const tasks = Array(5);
    setState({ tasks });

    expect(getState().mode).toBe(MODE.NORMAL);
    expect(getState().currentRow).toBe(0);
    transition("k");
    expect(getState().currentRow).toBe(4);
    transition("k");
    expect(getState().currentRow).toBe(3);
    transition("k");
    expect(getState().currentRow).toBe(2);
    transition("k");
    expect(getState().currentRow).toBe(1);
    transition("k");
    expect(getState().currentRow).toBe(0);
  });
});
