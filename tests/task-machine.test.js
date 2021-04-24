import { nanoid } from "nanoid";
import {
  taskMachine,
  createTask,
  DEFAULT_TASK_MACHINE_STATE,
} from "../src/task-machine";
import { MODE, TASK_TYPE } from "../src/types/enums";
import { getRandomIndex, insertAtIndex } from "../src/utils";

const randomString = nanoid();

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

  it("Should go from NORMAL to INSERT mode using 'o'", () => {
    const { getState } = taskMachine;
    const { transition } = getState();

    expect(getState().mode).toBe(MODE.NORMAL);
    transition("o");
    expect(getState().mode).toBe(MODE.INSERT);
  });

  it("Should go from INSERT to NORMAL mode using 'ESC'", () => {
    const { getState, setState } = taskMachine;
    const { transition } = getState();

    setState({ mode: MODE.INSERT });
    expect(getState().mode).toBe(MODE.INSERT);
    transition("", { escape: true });
    expect(getState().mode).toBe(MODE.NORMAL);
  });

  it("Should insert a draft task on the next row when transitioning from NORMAL to INSERT", () => {
    const { getState, setState } = taskMachine;
    const { transition } = getState();

    const sampleTasks = Array(5);
    const randomIndex = getRandomIndex(sampleTasks);

    setState({ tasks: sampleTasks, currentRow: randomIndex });
    transition("o");

    const nextRow = randomIndex + 1;
    const insertedTaskAtRandomIndex = getState().tasks[nextRow];

    expect(getState().tasks.length).toBe(sampleTasks.length + 1);
    expect(getState().currentRow).toBe(nextRow);
    expect(insertedTaskAtRandomIndex.type).toBe(TASK_TYPE.DRAFT);
    expect(insertedTaskAtRandomIndex.name).toBe("");
  });

  it("Should be able to update the draft task's name during insert mode", () => {
    const { getState, setState } = taskMachine;
    const { transition } = getState();

    const sampleTasks = Array(5);
    const randomIndex = getRandomIndex(sampleTasks);

    setState({
      tasks: insertAtIndex(
        sampleTasks,
        randomIndex,
        createTask(TASK_TYPE.DRAFT)
      ),
      currentRow: randomIndex,
      mode: MODE.INSERT,
    });

    transition(randomString);

    const taskAtRandomIndex = getState().tasks[randomIndex];
    expect(taskAtRandomIndex.name).toBe(randomString);
  });

  it("Should not commit a draft task when inputted with 'ESCAPE' during INSERT mode", () => {
    const { getState, setState } = taskMachine;
    const { transition } = getState();

    const sampleTasks = Array(5);
    const randomIndex = getRandomIndex(sampleTasks);

    setState({
      tasks: sampleTasks,
      currentRow: randomIndex,
    });

    transition("o");
    transition(randomString);

    const draftTask = getState().tasks[randomIndex + 1];
    expect(draftTask.name).toBe(randomString);

    transition("", { escape: true });
    expect(getState().tasks).toEqual(sampleTasks);
  });

  it("Should be able to commit a draft task when it contains a name and 'RETURN' is inputted during INSERT mode", () => {
    const { getState, setState } = taskMachine;
    const { transition } = getState();

    const sampleTasks = Array(5);
    const randomIndex = getRandomIndex(sampleTasks);

    setState({
      tasks: sampleTasks,
      currentRow: randomIndex,
    });

    transition("o");
    transition(randomString);
    transition("", { return: true });

    expect(getState().tasks.length).toBe(sampleTasks.length + 1);

    const committedTask = getState().tasks[randomIndex + 1];
    expect(committedTask.name).toEqual(randomString);
    expect(committedTask.type).toEqual(TASK_TYPE.ONGOING);
  });

  it("Commits a draft task then creates a new draft task right afterwards during INSERT mode when 'SHIFT + RETURN' is inputted", () => {
    const { getState, setState } = taskMachine;
    const { transition } = getState();

    const sampleTasks = Array(5);
    const randomIndex = getRandomIndex(sampleTasks);

    setState({
      tasks: sampleTasks,
      currentRow: randomIndex,
    });

    transition("o");
    transition(randomString);
    transition("", { shift: true, return: true });

    expect(getState().tasks.length).toBe(sampleTasks.length + 2);

    const committedTask = getState().tasks[randomIndex + 1];
    expect(committedTask.name).toEqual(randomString);
    expect(committedTask.type).toEqual(TASK_TYPE.ONGOING);

    const draftTask = getState().tasks[randomIndex + 2];
    expect(draftTask.name).toEqual("");
    expect(draftTask.type).toEqual(TASK_TYPE.DRAFT);
  });

  it("Should not commit a draft task when it contains an empty name", () => {
    const { getState, setState } = taskMachine;
    const { transition } = getState();

    const sampleTasks = Array(5);
    const randomIndex = getRandomIndex(sampleTasks);

    setState({
      tasks: sampleTasks,
      currentRow: randomIndex,
    });

    transition("o");
    transition("", { return: true });

    expect(getState().tasks.length).toBe(sampleTasks.length + 1);

    const draftTask = getState().tasks[randomIndex + 1];
    expect(draftTask.name).toEqual("");
    expect(draftTask.type).toEqual(TASK_TYPE.DRAFT);
  });
});
