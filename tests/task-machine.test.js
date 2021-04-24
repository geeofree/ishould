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

  test("Should be able to cycle forwards on the row when in NORMAL mode", () => {
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

  test("Should be able to cycle backwards on the row when in NORMAL mode", () => {
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

  test("Should be able to insert a draft task", () => {
    const { getState, setState } = taskMachine;
    const { transition } = getState();

    const sampleTasks = Array(5);
    const randomIndex = getRandomIndex(sampleTasks);

    setState({ tasks: sampleTasks, currentRow: randomIndex });

    expect(getState().mode).toBe(MODE.NORMAL);
    transition("o");
    expect(getState().mode).toBe(MODE.INSERT);

    const nextRow = randomIndex + 1;
    const insertedTaskAtRandomIndex = getState().tasks[nextRow];

    expect(getState().tasks.length).toBe(sampleTasks.length + 1);
    expect(getState().currentRow).toBe(nextRow);
    expect(insertedTaskAtRandomIndex.type).toBe(TASK_TYPE.DRAFT);
    expect(insertedTaskAtRandomIndex.name).toBe("");
  });

  test("Should be able to update the draft task's name during INSERT mode", () => {
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

  test("Should be able to discard a task and transition from INSERT to NORMAL", () => {
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

  test("Should be able to commit a draft task then transition from INSERT to NORMAL mode", () => {
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

    expect(getState().mode).toBe(MODE.NORMAL);
    expect(getState().tasks.length).toBe(sampleTasks.length + 1);

    const committedTask = getState().tasks[randomIndex + 1];
    expect(committedTask.name).toEqual(randomString);
    expect(committedTask.type).toEqual(TASK_TYPE.ONGOING);
  });

  test("Should be able to commit a draft task behind the current draft task in INSERT mode", () => {
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

    expect(getState().mode).toBe(MODE.INSERT);
    expect(getState().tasks.length).toBe(sampleTasks.length + 2);

    const committedTask = getState().tasks[randomIndex + 1];
    expect(committedTask.type).toEqual(TASK_TYPE.ONGOING);
    expect(committedTask.name).toEqual(randomString);

    const draftTask = getState().tasks[randomIndex + 2];
    expect(draftTask.type).toEqual(TASK_TYPE.DRAFT);
    expect(draftTask.name).toEqual("");
  });

  test("Should not be able to commit a draft task when it contains an empty name", () => {
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
    transition("", { shift: true, return: true });

    expect(getState().tasks.length).toBe(sampleTasks.length + 1);

    const draftTask = getState().tasks[randomIndex + 1];
    expect(draftTask.name).toEqual("");
    expect(draftTask.type).toEqual(TASK_TYPE.DRAFT);
  });

  test("Should provide a way for a committed task to go into a DRAFT state where it can be updated", () => {
    const { getState, setState } = taskMachine;
    const { transition } = getState();

    const sampleTasks = Array(5)
      .fill()
      .map(() => createTask(TASK_TYPE.ONGOING, randomString));
    const randomIndex = getRandomIndex(sampleTasks);

    setState({ tasks: sampleTasks, currentRow: randomIndex });

    expect(getState().mode).toBe(MODE.NORMAL);
    expect(getState().getCurrentTask().type).toBe(TASK_TYPE.ONGOING);

    transition("i");
    expect(getState().currentRow).toBe(randomIndex);
    expect(getState().mode).toBe(MODE.INSERT);

    const currentTask = getState().getCurrentTask();
    expect(currentTask.type).toBe(TASK_TYPE.DRAFT);
  });

  test("When a committed task is going into DRAFT state, current column value should be equal to that committed task's name initially", () => {
    const { getState, setState } = taskMachine;
    const { transition } = getState();

    const sampleTasks = Array(5)
      .fill()
      .map(() => createTask(TASK_TYPE.ONGOING, randomString));
    const randomIndex = getRandomIndex(sampleTasks);

    setState({ tasks: sampleTasks, currentRow: randomIndex });

    transition("i");
    expect(getState().currentCol).toBe(getState().getCurrentTask().name.length);
  });

  test("Should be able to move column value forwards when task is being updated", () => {
    const { getState, setState } = taskMachine;
    const { transition } = getState();

    const textString = "hello";

    setState({
      tasks: [createTask(TASK_TYPE.ONGOING, textString)],
      currentCol: 0,
      mode: MODE.INSERT,
    });

    expect(getState().currentCol).toBe(0);
    transition("", { rightArrow: true });
    expect(getState().currentCol).toBe(1);
    transition("", { rightArrow: true });
    expect(getState().currentCol).toBe(2);
    transition("", { rightArrow: true });
    expect(getState().currentCol).toBe(3);
    transition("", { rightArrow: true });
    expect(getState().currentCol).toBe(4);
    transition("", { rightArrow: true });
    expect(getState().currentCol).toBe(textString.length);
    transition("", { rightArrow: true });
    expect(getState().currentCol).toBe(5);
  });

  test("Should be able to move column value backwards when task is being updated", () => {
    const { getState, setState } = taskMachine;
    const { transition } = getState();

    const textString = "hello";

    setState({
      tasks: [createTask(TASK_TYPE.ONGOING, textString)],
      currentCol: textString.length,
      mode: MODE.INSERT,
    });

    expect(getState().currentCol).toBe(textString.length);
    transition("", { leftArrow: true });
    expect(getState().currentCol).toBe(textString.length - 1);
    transition("", { leftArrow: true });
    expect(getState().currentCol).toBe(textString.length - 2);
    transition("", { leftArrow: true });
    expect(getState().currentCol).toBe(textString.length - 3);
    transition("", { leftArrow: true });
    expect(getState().currentCol).toBe(textString.length - 4);
    transition("", { leftArrow: true });
    expect(getState().currentCol).toBe(0);
    transition("", { leftArrow: true });
    expect(getState().currentCol).toBe(0);
  });
});
