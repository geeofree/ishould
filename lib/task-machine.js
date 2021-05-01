"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createTask = createTask;
exports.useTaskMachine = exports.taskMachine = exports.DEFAULT_TASK_MACHINE_STATE = void 0;

var _nanoid = require("nanoid");

var _zustand = _interopRequireDefault(require("zustand"));

var _vanilla = _interopRequireDefault(require("zustand/vanilla"));

var _enums = require("./types/enums");

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createTask(taskType, taskName = "") {
  return {
    id: (0, _nanoid.nanoid)(),
    name: taskName,
    type: taskType
  };
}

const DEFAULT_TASK_MACHINE_STATE = {
  origDraftOngoingTaskName: null,
  tasks: [],
  currentRow: -1,
  currentCol: -1,
  mode: _enums.MODE.NORMAL
};
exports.DEFAULT_TASK_MACHINE_STATE = DEFAULT_TASK_MACHINE_STATE;
const taskMachine = (0, _vanilla.default)((set, get) => ({ ...DEFAULT_TASK_MACHINE_STATE,

  getCurrentTask() {
    const {
      tasks,
      currentRow
    } = get();
    return tasks[currentRow];
  },

  transition(input, key) {
    switch (get().mode) {
      case _enums.MODE.NORMAL:
        {
          switch (true) {
            case input === "j":
              set(state => ({
                currentRow: (state.currentRow + 1) % state.tasks.length
              }));
              break;

            case input === "k":
              set(state => {
                const prevRow = state.currentRow - 1;
                return {
                  currentRow: prevRow < 0 ? state.tasks.length - 1 : prevRow
                };
              });
              break;

            case input === "i":
              set(state => ({
                mode: _enums.MODE.INSERT,
                currentRow: state.currentRow + 1,
                currentCol: 0,
                tasks: (0, _utils.insertAtIndex)(state.tasks, state.currentRow + 1, createTask(_enums.TASK_TYPE.DRAFT))
              }));
              break;

            case input === "u":
              set(state => {
                const currentTask = state.getCurrentTask();

                if (state.tasks.length === 0 || currentTask.type === _enums.TASK_TYPE.FINISHED) {
                  return state;
                }

                const newTasks = (0, _utils.insertAtIndex)(state.tasks, state.currentRow, { ...currentTask,
                  type: _enums.TASK_TYPE.DRAFT_ONGOING
                }, true);
                return {
                  mode: _enums.MODE.INSERT,
                  tasks: newTasks,
                  origDraftOngoingTaskName: currentTask.name,
                  currentCol: currentTask.name.length
                };
              });
              break;

            case input === "D":
              set(state => {
                if (state.tasks.length === 0) {
                  return state;
                }

                return {
                  tasks: (0, _utils.removeAtIndex)(state.tasks, state.currentRow),
                  currentRow: state.currentRow === state.tasks.length - 1 ? state.currentRow - 1 : state.currentRow
                };
              });
              break;

            case input === " ":
              set(state => {
                const currentTask = state.getCurrentTask();
                return {
                  tasks: (0, _utils.insertAtIndex)(state.tasks, state.currentRow, { ...currentTask,
                    type: currentTask.type === _enums.TASK_TYPE.ONGOING ? _enums.TASK_TYPE.FINISHED : _enums.TASK_TYPE.ONGOING
                  }, true)
                };
              });
              break;

            default:
              // NOOP
              break;
          }

          break;
        }

      case _enums.MODE.INSERT:
        {
          switch (true) {
            case key === null || key === void 0 ? void 0 : key.escape:
              set(state => {
                const currentTask = state.getCurrentTask();
                let nextCurrentRow;
                let nextTasks;

                switch (currentTask.type) {
                  case _enums.TASK_TYPE.DRAFT:
                    nextCurrentRow = state.currentRow - 1;
                    nextTasks = (0, _utils.removeAtIndex)(state.tasks, state.currentRow);
                    break;

                  case _enums.TASK_TYPE.DRAFT_ONGOING:
                    nextCurrentRow = state.currentRow;
                    nextTasks = (0, _utils.insertAtIndex)(state.tasks, state.currentRow, { ...currentTask,
                      type: _enums.TASK_TYPE.ONGOING,
                      name: state.origDraftOngoingTaskName
                    }, true);
                    break;

                  default:
                    // no-op
                    break;
                }

                return {
                  origDraftOngoingTaskName: DEFAULT_TASK_MACHINE_STATE.origDraftOngoingTaskName,
                  mode: _enums.MODE.NORMAL,
                  currentRow: nextCurrentRow,
                  tasks: nextTasks
                };
              });
              break;

            case (key === null || key === void 0 ? void 0 : key.ctrl) && input === "o":
              set(state => {
                const draftTask = state.tasks[state.currentRow];

                if (!draftTask.name) {
                  return state;
                }

                const newTasks = (0, _utils.insertAtIndex)(state.tasks, state.currentRow, createTask(_enums.TASK_TYPE.ONGOING, draftTask.name));
                const nextCurrentRow = state.currentRow + 1;
                newTasks[nextCurrentRow].name = "";
                return {
                  tasks: newTasks,
                  currentCol: 0,
                  currentRow: nextCurrentRow
                };
              });
              break;

            case key === null || key === void 0 ? void 0 : key.return:
              set(state => {
                const draftTask = state.tasks[state.currentRow];

                if (!draftTask.name) {
                  return state;
                }

                const newTasks = (0, _utils.insertAtIndex)(state.tasks, state.currentRow, createTask(_enums.TASK_TYPE.ONGOING, draftTask.name), true);
                return {
                  mode: _enums.MODE.NORMAL,
                  tasks: newTasks
                };
              });
              break;

            case key === null || key === void 0 ? void 0 : key.leftArrow:
              set(state => ({
                currentCol: Math.max(state.currentCol - 1, 0)
              }));
              break;

            case key === null || key === void 0 ? void 0 : key.rightArrow:
              set(state => ({
                currentCol: Math.min(state.currentCol + 1, state.getCurrentTask().name.length)
              }));
              break;

            case key === null || key === void 0 ? void 0 : key.delete:
              set(state => {
                const currentTask = state.getCurrentTask();
                const nextCurrentCol = Math.max(state.currentCol - 1, 0);
                const nextDraftTaskName = (0, _utils.removeAtIndex)(currentTask.name.split(""), nextCurrentCol).join("");
                const nexTasks = (0, _utils.insertAtIndex)(state.tasks, state.currentRow, { ...currentTask,
                  name: nextDraftTaskName
                }, true);
                return {
                  tasks: nexTasks,
                  currentCol: nextCurrentCol
                };
              });
              break;

            default:
              set(state => {
                const draftTask = state.getCurrentTask();
                const newDraftTaskName = (0, _utils.insertAtIndex)(draftTask.name.split(""), state.currentCol, input).join("");
                const newTasks = (0, _utils.insertAtIndex)(state.tasks, state.currentRow, { ...draftTask,
                  name: newDraftTaskName
                }, true);
                return {
                  tasks: newTasks,
                  currentCol: state.currentCol + input.length
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
  }

}));
exports.taskMachine = taskMachine;
const useTaskMachine = (0, _zustand.default)(taskMachine);
exports.useTaskMachine = useTaskMachine;