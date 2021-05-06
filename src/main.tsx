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

      yargs.positional("file", {
        type: "string",
        describe: "File to boot from and save into",
        alias: "f",
      });
    }
  )
  .alias("v", "version")
  .alias("h", "help")
  .help().argv;

render(<App title={argv.title as string} filePath={argv.file as string} />);
