#!/usr/bin/env node

const pkg = require('./package.json')
const { Command } = require('commander')
const clone = require('./clone.js')

const program = new Command()

program.usage('[command] [options]').version(pkg.version, '-V')

program.on('--help', () => {})

program
  .command('clone')
  .description('通过jenkins发布测试环境项目')
  .action(() => {
    const argv = process.argv
    if (argv && argv[3]) {
      clone.checkHubEffective(argv[3])
    }
  })

program.parse(process.argv)