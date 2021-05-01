#!/usr/bin/env node
"use strict";

var _react = _interopRequireDefault(require("react"));

var _ink = require("ink");

var _yargs = _interopRequireDefault(require("yargs"));

var _taskUi = _interopRequireDefault(require("./task-ui"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const argv = (0, _yargs.default)(process.argv.slice(2)).scriptName("ishould").command("$0 [title] [options]", "NodeJS interactive CLI TODO list", yargs => {
  yargs.positional("title", {
    default: "TODO",
    type: "string",
    describe: "The title of the TODO list"
  });
}).alias("v", "version").alias("h", "help").help().argv;
(0, _ink.render)( /*#__PURE__*/_react.default.createElement(_taskUi.default, {
  title: argv.title
}));