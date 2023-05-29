#!/usr/bin/env node
const program = require("commander")

program
  .name('myVue')
  .version('1.0.0')
  .usage('<command> [options]')
  .command('create <app-name>', 'create a new project powered by my-vue-cli')

program.parse(process.argv)
console.log('vue 命令执行')