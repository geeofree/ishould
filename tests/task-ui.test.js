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

  test("Should be able to COMMIT-INSERT a task", async () => {
    const renderer = await getRenderer(<App title="TODO" />);

    expect(renderer.lastFrame()).toMatchSnapshot();
    await renderer.input("i");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("Alpha");
    await renderer.input("\u000f");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("Beta");
    await renderer.input("\u000f");
    expect(renderer.lastFrame()).toMatchSnapshot();

    await renderer.input("Gamma");
    await renderer.input("\u000f");
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

  /**
   * TODO: Create assertions for the ff. cases:
   *  - Should be able to remove a committed task
   **/
});
