import React, { ReactElement } from "react";
import { Box, Text, useInput } from "ink";
import {
  useTaskMachine,
  useBootFromSaveFile,
  useWriteToSaveFile,
} from "./hooks";
import { Task } from "./types/interfaces";
import { TASK_TYPE } from "./types/enums";

interface TaskItemProps {
  task: Task;
  isFocused: boolean;
  currentCol: number;
}

interface TaskProps {
  filePath: string;
}

interface AppProps {
  title: string;
}

function TaskItem(props: TaskItemProps): ReactElement {
  const { task, currentCol, isFocused } = props;

  let taskName: string | ReactElement[] = task.name;

  if (task.type === TASK_TYPE.DRAFT || task.type === TASK_TYPE.DRAFT_ONGOING) {
    taskName = (task.name + " ").split("").map((c, i) => (
      <Text key={i} inverse={i === currentCol}>
        {c}
      </Text>
    ));
  }

  let taskTypeIndicator: string;
  switch (task.type) {
    case TASK_TYPE.DRAFT:
    case TASK_TYPE.DRAFT_ONGOING:
      taskTypeIndicator = " * ";
      break;

    case TASK_TYPE.ONGOING:
      taskTypeIndicator = "[ ]";
      break;

    case TASK_TYPE.FINISHED:
      taskTypeIndicator = "[x]";
      break;
  }

  return (
    <Box marginBottom={1}>
      <Box alignItems="flex-start">
        <Text color="cyanBright" bold>
          {isFocused ? "\u279c" : " "}
        </Text>
      </Box>

      <Box marginX={1} alignItems="flex-start">
        <Text dimColor={task.type === TASK_TYPE.FINISHED}>
          {taskTypeIndicator}
        </Text>
      </Box>

      <Box flexGrow={1}>
        <Text
          dimColor={task.type === TASK_TYPE.FINISHED}
          strikethrough={task.type === TASK_TYPE.FINISHED}
        >
          {taskName}
        </Text>
      </Box>
    </Box>
  );
}

function Tasks(props: TaskProps): ReactElement {
  const { filePath } = props;
  const taskMachine = useTaskMachine();
  const { tasks, transition, currentRow, currentCol } = taskMachine;

  useBootFromSaveFile(filePath);
  useWriteToSaveFile(filePath);
  useInput(transition);

  if (tasks.length === 0) {
    return <Text color="red">No tasks created yet</Text>;
  }

  return (
    <Box flexDirection="column">
      {tasks.map((task, index) => (
        <TaskItem
          key={task.id}
          task={task}
          isFocused={currentRow === index}
          currentCol={currentCol}
        />
      ))}
    </Box>
  );
}

function App(props: AppProps & TaskProps): ReactElement {
  const { title, filePath } = props;
  return (
    <Box padding={1}>
      <Box padding={1} borderStyle="bold" flexDirection="column" width={56}>
        <Box marginBottom={1}>
          <Text color="magenta">{title}</Text>
        </Box>

        <Tasks filePath={filePath} />
      </Box>
    </Box>
  );
}

export default App;
