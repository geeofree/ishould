import { nanoid } from "nanoid";
import {
  taskMachine,
  createTask,
  DEFAULT_TASK_MACHINE_STATE,
} from "../src/task-machine";
import { MODE, TASK_TYPE } from "../src/types/enums";
import {
  getRandomIndex,
  getRandomNumber,
  insertAtIndex,
  removeAtIndex,
} from "../src/utils";

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
    expect(getState().currentRow).toBe(-1);

    transition("j");
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
    expect(getState().currentRow).toBe(-1);

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

  test("When a committed task is going into DRAFT state, current column value should be equal to that committed task's name length initially", () => {
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
      currentRow: 0,
      currentCol: 0,
      mode: MODE.INSERT,
    });

    expect(getState().mode).toBe(MODE.INSERT);
    expect(getState().currentRow).toBe(0);
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
    expect(getState().currentCol).toBe(textString.length);
  });

  test("Should be able to move column value backwards when task is being updated", () => {
    const { getState, setState } = taskMachine;
    const { transition } = getState();

    const textString = "hello";

    setState({
      tasks: [createTask(TASK_TYPE.ONGOING, textString)],
      currentRow: 0,
      currentCol: textString.length,
      mode: MODE.INSERT,
    });

    expect(getState().mode).toBe(MODE.INSERT);
    expect(getState().currentRow).toBe(0);
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

  test("Should be able to remove a committed task", () => {
    const { getState, setState } = taskMachine;
    const { transition } = getState();

    const sampleTasks = Array(getRandomNumber(21, 5)).fill();

    setState({ tasks: sampleTasks });

    sampleTasks.forEach((_, i) => {
      expect(getState().mode).toBe(MODE.NORMAL);
      expect(getState().tasks.length).toBe(sampleTasks.length - i);

      transition("D");
    });

    expect(getState().mode).toBe(MODE.NORMAL);
    expect(getState().tasks.length).toBe(0);

    transition("D");

    expect(getState().mode).toBe(MODE.NORMAL);
    expect(getState().tasks.length).not.toBe(-1);
  });

  test("When a committed task is removed and the current row is at the end of the task, current row should move backwards", () => {
    const { getState, setState } = taskMachine;
    const { transition } = getState();

    const sampleTasks = Array(getRandomNumber(20, 5));

    setState({ tasks: sampleTasks, currentRow: sampleTasks.length - 1 });

    expect(getState().mode).toBe(MODE.NORMAL);
    expect(getState().currentRow).toBe(sampleTasks.length - 1);

    transition("D");

    expect(getState().currentRow).toBe(sampleTasks.length - 2);
  });

  test("When a committed task is removed and the current row is not at the end of the task, current row should stay in position", () => {
    const { getState, setState } = taskMachine;
    const { transition } = getState();

    const sampleTasks = Array(5);
    const randomIndex = Math.min(
      getRandomIndex(sampleTasks),
      sampleTasks.length - 2
    );

    setState({ tasks: sampleTasks, currentRow: randomIndex });

    expect(getState().mode).toBe(MODE.NORMAL);
    expect(getState().currentRow).toBe(randomIndex);
    expect(getState().currentRow).not.toBe(sampleTasks.length);

    transition("D");

    expect(getState().currentRow).toBe(randomIndex);
  });

  test("Should be able to add a prefix to the task's name when updating", () => {
    const { getState, setState } = taskMachine;
    const { transition } = getState();

    setState({
      tasks: [createTask(TASK_TYPE.DRAFT, randomString)],
      currentRow: 0,
      currentCol: 0,
      mode: MODE.INSERT,
    });

    expect(getState().mode).toBe(MODE.INSERT);
    expect(getState().currentRow).toBe(0);
    expect(getState().currentCol).toBe(0);
    expect(getState().getCurrentTask().name).toBe(randomString);

    const testString = "hello world";
    transition(testString);

    const currentTask = getState().getCurrentTask();
    expect(getState().currentCol).toBe(testString.length);
    expect(currentTask.name.length).toBe(
      randomString.length + testString.length
    );
    expect(currentTask.name.substr(0, testString.length)).toBe(testString);
  });

  test("Should be able to add a suffix to the task's name when updating", () => {
    const { getState, setState } = taskMachine;
    const { transition } = getState();

    setState({
      tasks: [createTask(TASK_TYPE.DRAFT, randomString)],
      currentRow: 0,
      currentCol: randomString.length,
      mode: MODE.INSERT,
    });

    expect(getState().mode).toBe(MODE.INSERT);
    expect(getState().currentRow).toBe(0);
    expect(getState().currentCol).toBe(randomString.length);
    expect(getState().getCurrentTask().name).toBe(randomString);

    const testString = "hello world";
    transition(testString);

    const currentTask = getState().getCurrentTask();
    const newTaskNameLength = randomString.length + testString.length;

    expect(getState().currentCol).toBe(newTaskNameLength);
    expect(currentTask.name.length).toBe(newTaskNameLength);
    expect(currentTask.name.substr(randomString.length)).toBe(testString);
  });

  test("Should be able to add an infix to the task's name when updating", () => {
    const { getState, setState } = taskMachine;
    const { transition } = getState();

    const randomIndex = getRandomNumber(randomString.length - 2, 1);

    setState({
      tasks: [createTask(TASK_TYPE.DRAFT, randomString)],
      currentRow: 0,
      currentCol: randomIndex,
      mode: MODE.INSERT,
    });

    expect(getState().mode).toBe(MODE.INSERT);
    expect(getState().currentRow).toBe(0);
    expect(getState().currentCol).toBe(randomIndex);
    expect(getState().getCurrentTask().name).toBe(randomString);

    const testString = "hello world";
    transition(testString);

    const currentTask = getState().getCurrentTask();

    expect(getState().currentCol).toBe(randomIndex + testString.length);
    expect(currentTask.name.length).toBe(
      randomString.length + testString.length
    );
    expect(currentTask.name.substr(randomIndex, testString.length)).toBe(
      testString
    );
  });

  test("Should be able to remove a single character from the task's name at the current column when updating", () => {
    const { getState, setState } = taskMachine;
    const { transition } = getState();

    const randomIndex = getRandomNumber(randomString.length + 1);

    setState({
      tasks: [createTask(TASK_TYPE.DRAFT, randomString)],
      currentRow: 0,
      currentCol: randomIndex,
      mode: MODE.INSERT,
    });

    expect(getState().mode).toBe(MODE.INSERT);
    expect(getState().currentRow).toBe(0);
    expect(getState().currentCol).toBe(randomIndex);
    expect(getState().getCurrentTask().name).toBe(randomString);

    transition("", { delete: true });

    const currentTask = getState().getCurrentTask();
    const nextCurrentCol = Math.max(randomIndex - 1, 0);

    expect(getState().currentCol).toBe(nextCurrentCol);
    expect(currentTask.name.length).toBe(randomString.length - 1);

    const expectedTaskName = removeAtIndex(
      randomString.split(""),
      nextCurrentCol
    ).join("");

    expect(currentTask.name).toBe(expectedTaskName);
  });
});
