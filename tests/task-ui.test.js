import React from "react";
import App from "../src/task-ui";
import { render } from "ink-testing-library";
import { promisify } from "util";
import { DEFAULT_TASK_MACHINE_STATE, taskMachine } from "../src/task-machine";

const delay = promisify(setTimeout);

async function getRenderer(tree) {
  const renderer = render(tree);
  await delay();

  const input = async (input) => {
    renderer.stdin.write(input);
    await delay();
  };

  return {
    ...renderer,
    input,
  };
}

describe("Task UI", () => {
  afterEach(() => {
    taskMachine.setState(DEFAULT_TASK_MACHINE_STATE);
  });

  test("Should be able to update the UI's title", async () => {
    const renderer = await getRenderer(<App title="TODO" />);
    expect(renderer.lastFrame()).toMatchSnapshot();

    renderer.rerender(<App title="My TODO list" />);
    expect(renderer.lastFrame()).toMatchSnapshot();
  });

  test("Should be able to insert tasks", async () => {
    const renderer = await getRenderer(<App title="TODO" />);

    await renderer.input("i");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("Hello World");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("\r");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("i");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("Hello World");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("\r");
    expect(renderer.lastFrame()).toMatchSnapshot();
  });

  test("Should be able to update a task", async () => {
    const renderer = await getRenderer(<App title="TODO" />);

    await renderer.input("i");
    await renderer.input("Alpha");
    await renderer.input("\r");

    await renderer.input("i");
    await renderer.input("Beta");
    await renderer.input("\r");

    await renderer.input("i");
    await renderer.input("Gamma");
    await renderer.input("\r");

    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("u");
    await renderer.input(" Ray");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("\r");
    expect(renderer.lastFrame()).toMatchSnapshot();
  });

  test("Should be able to cycle row forwards", async () => {
    const renderer = await getRenderer(<App title="TODO" />);

    await renderer.input("i");
    await renderer.input("Alpha");
    await renderer.input("\r");

    await renderer.input("i");
    await renderer.input("Beta");
    await renderer.input("\r");

    await renderer.input("i");
    await renderer.input("Gamma");
    await renderer.input("\r");

    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("j");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("j");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("j");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("j");
    expect(renderer.lastFrame()).toMatchSnapshot();
  });

  test("Should be able to cycle row backwards", async () => {
    const renderer = await getRenderer(<App title="TODO" />);

    await renderer.input("i");
    await renderer.input("Alpha");
    await renderer.input("\r");

    await renderer.input("i");
    await renderer.input("Beta");
    await renderer.input("\r");

    await renderer.input("i");
    await renderer.input("Gamma");
    await renderer.input("\r");

    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("k");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("k");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("k");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("k");
    expect(renderer.lastFrame()).toMatchSnapshot();
  });

  test("Should be able to navigate through each character backwards when editing a task", async () => {
    const renderer = await getRenderer(<App title="TODO" />);

    await renderer.input("i");
    await renderer.input("TODO");
    await renderer.input("\r");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("u");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("\u001B[D");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("\u001B[D");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("\u001B[D");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("\u001B[D");
    expect(renderer.lastFrame()).toMatchSnapshot();
  });

  test("Should be able to navigate through each character forwards when editing a task", async () => {
    const renderer = await getRenderer(<App title="TODO" />);

    await renderer.input("i");
    await renderer.input("TODO");
    await renderer.input("\r");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("u");
    taskMachine.setState({ currentCol: 0 });
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("\u001B[C");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("\u001B[C");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("\u001B[C");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("\u001B[C");
    expect(renderer.lastFrame()).toMatchSnapshot();
  });

  test("Should be able to discard a DRAFT task", async () => {
    const renderer = await getRenderer(<App title="TODO" />);
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("i");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("\u001b");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("i");

    await renderer.input("Alpha");
    await renderer.input("\u000f");

    await renderer.input("Beta");
    await renderer.input("\u000f");

    await renderer.input("Gamma");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("\u001b");
    expect(renderer.lastFrame()).toMatchSnapshot();
  });

  test("Should be able to discard uncommitted changes of an ONGOING task", async () => {
    const renderer = await getRenderer(<App title="TODO" />);

    await renderer.input("i");
    await renderer.input("Gamma");
    await renderer.input("\r");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("u");
    await renderer.input(" Ray");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("\u001b");
    expect(renderer.lastFrame()).toMatchSnapshot();
  });

  test("Should be able to toggle a task from ONGOING to FINISHED and vice versa", async () => {
    const renderer = await getRenderer(<App title="TODO" />);

    await renderer.input("i");
    await renderer.input("Gamma");
    await renderer.input("\r");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input(" ");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input(" ");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input(" ");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input(" ");
    expect(renderer.lastFrame()).toMatchSnapshot();
  });

  test("Should not be able update a FINISHED task", async () => {
    const renderer = await getRenderer(<App title="TODO" />);

    await renderer.input("i");
    await renderer.input("Gamma");
    await renderer.input("\r");
    await renderer.input(" ");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("u");
    expect(renderer.lastFrame()).toMatchSnapshot();
  });

  test("Should be able to remove a committed task", async () => {
    const renderer = await getRenderer(<App title="TODO" />);

    await renderer.input("i");

    await renderer.input("Alpha");
    await renderer.input("\u000f");

    await renderer.input("Beta");
    await renderer.input("\u000f");

    await renderer.input("Gamma");
    await renderer.input("\r");

    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("D");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("D");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("D");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("D");
    expect(renderer.lastFrame()).toMatchSnapshot();
  });

  test("Should be able to add a prefix to a task's name", async () => {
    const renderer = await getRenderer(<App title="TODO" />);

    await renderer.input("i");
    await renderer.input("hello");
    taskMachine.setState({ currentCol: 0 });

    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("hi, ");

    expect(renderer.lastFrame()).toMatchSnapshot();
  });

  test("Should be able to add a suffix to a task's name", async () => {
    const renderer = await getRenderer(<App title="TODO" />);

    await renderer.input("i");
    await renderer.input("hello");

    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input(" world");

    expect(renderer.lastFrame()).toMatchSnapshot();
  });

  test("Should be able to add an infix to a task's name", async () => {
    const renderer = await getRenderer(<App title="TODO" />);

    await renderer.input("i");
    await renderer.input("hello");
    taskMachine.setState({ currentCol: 2 });

    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("y, he");

    expect(renderer.lastFrame()).toMatchSnapshot();
  });

  test("Should not be able to commit a DRAFT task with an empty name", async () => {
    const renderer = await getRenderer(<App title="TODO" />);

    await renderer.input("i");
    await renderer.input("\r");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("hello there");
    await renderer.input("\u000f");
    await renderer.input("\r");
    expect(renderer.lastFrame()).toMatchSnapshot();
  });

  test("Should not be able to delete a character when cursor is at start of the task's name", async () => {
    const renderer = await getRenderer(<App title="TODO" />);

    await renderer.input("i");
    await renderer.input("Alpha");
    expect(renderer.lastFrame()).toMatchSnapshot();

    taskMachine.setState({ currentCol: 0 });
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("\u007f");
    expect(renderer.lastFrame()).toMatchSnapshot();
  });
});
