"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _ink = require("ink");

var _taskMachine = require("./task-machine");

var _enums = require("./types/enums");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function TaskItem(props) {
  const {
    task,
    currentCol,
    isFocused
  } = props;
  let taskName = task.name;

  if (task.type === _enums.TASK_TYPE.DRAFT || task.type === _enums.TASK_TYPE.DRAFT_ONGOING) {
    taskName = (task.name + " ").split("").map((c, i) => /*#__PURE__*/_react.default.createElement(_ink.Text, {
      key: i,
      inverse: i === currentCol
    }, c));
  }

  let taskTypeIndicator;

  switch (task.type) {
    case _enums.TASK_TYPE.DRAFT:
    case _enums.TASK_TYPE.DRAFT_ONGOING:
      taskTypeIndicator = " * ";
      break;

    case _enums.TASK_TYPE.ONGOING:
      taskTypeIndicator = "[ ]";
      break;

    case _enums.TASK_TYPE.FINISHED:
      taskTypeIndicator = "[x]";
      break;
  }

  return /*#__PURE__*/_react.default.createElement(_ink.Box, {
    marginBottom: 1
  }, /*#__PURE__*/_react.default.createElement(_ink.Box, {
    alignItems: "flex-start"
  }, /*#__PURE__*/_react.default.createElement(_ink.Text, {
    color: "cyanBright",
    bold: true
  }, isFocused ? "\u279c" : " ")), /*#__PURE__*/_react.default.createElement(_ink.Box, {
    marginX: 1,
    alignItems: "flex-start"
  }, /*#__PURE__*/_react.default.createElement(_ink.Text, {
    dimColor: task.type === _enums.TASK_TYPE.FINISHED
  }, taskTypeIndicator)), /*#__PURE__*/_react.default.createElement(_ink.Box, {
    flexGrow: 1
  }, /*#__PURE__*/_react.default.createElement(_ink.Text, {
    dimColor: task.type === _enums.TASK_TYPE.FINISHED,
    strikethrough: task.type === _enums.TASK_TYPE.FINISHED
  }, taskName)));
}

function Tasks() {
  const taskMachine = (0, _taskMachine.useTaskMachine)();
  const {
    tasks,
    transition,
    currentRow,
    currentCol
  } = taskMachine;
  (0, _ink.useInput)(transition);

  if (tasks.length === 0) {
    return /*#__PURE__*/_react.default.createElement(_ink.Text, {
      color: "red"
    }, "No tasks created yet");
  }

  return /*#__PURE__*/_react.default.createElement(_ink.Box, {
    flexDirection: "column"
  }, tasks.map((task, index) => /*#__PURE__*/_react.default.createElement(TaskItem, {
    key: task.id,
    task: task,
    isFocused: currentRow === index,
    currentCol: currentCol
  })));
}

function App(props) {
  const {
    title
  } = props;
  return /*#__PURE__*/_react.default.createElement(_ink.Box, {
    padding: 1,
    margin: 1,
    borderStyle: "bold",
    flexDirection: "column"
  }, /*#__PURE__*/_react.default.createElement(_ink.Box, {
    marginBottom: 1
  }, /*#__PURE__*/_react.default.createElement(_ink.Text, {
    color: "magenta"
  }, title)), /*#__PURE__*/_react.default.createElement(Tasks, null));
}

var _default = App;
exports.default = _default;