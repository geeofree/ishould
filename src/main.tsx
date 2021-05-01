#!/usr/bin/env node
import React from "react";
import { render } from "ink";
import yargs from "yargs";
import App from "./task-ui";

const argv = yargs(process.argv.slice(2))
  .scriptName("ishould")
  .command(
    "$0 [title] [options]",
    "NodeJS interactive CLI TODO list",
    (yargs) => {
      yargs.positional("title", {
        default: "TODO",
        type: "string",
        describe: "The title of the TODO list",
      });
    }
  )
  .alias("v", "version")
  .alias("h", "help")
  .help().argv;

render(<App title={argv.title as string} />);
