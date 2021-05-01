"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TASK_TYPE = exports.MODE = void 0;
let MODE;
exports.MODE = MODE;

(function (MODE) {
  MODE["NORMAL"] = "NORMAL_MODE";
  MODE["INSERT"] = "INSERT_MODE";
})(MODE || (exports.MODE = MODE = {}));

let TASK_TYPE;
exports.TASK_TYPE = TASK_TYPE;

(function (TASK_TYPE) {
  TASK_TYPE["DRAFT"] = "DRAFT_TASK";
  TASK_TYPE["ONGOING"] = "ONGOING_TASK";
  TASK_TYPE["DRAFT_ONGOING"] = "DRAFT_ONGOING_TASK";
  TASK_TYPE["FINISHED"] = "FINISHED_TASK";
})(TASK_TYPE || (exports.TASK_TYPE = TASK_TYPE = {}));