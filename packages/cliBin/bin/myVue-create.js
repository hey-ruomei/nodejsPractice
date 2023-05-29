#!/usr/bin/env node
const program = require("commander")
program
	.on("--help", ()=>{
		console.log("请求帮助")
	})
	.on("exit", ()=>{
		console.log("退出")
	})
	.action( ()=>{
		// console.log("命令执行完成")
	})
console.log('子命令解析完成')
program.parse(process.argv)

