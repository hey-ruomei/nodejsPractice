const fs = require('fs')
const path = require('path')
const CONST = require('./const.js')
const urlencode = require('urlencode')
const axios = require('axios')
// 获取文件列表
async function getFileListFromGitLab (path, filter) {
  const url = `${CONST.GITLAB}/api/v4/projects/${CONST.projectId}/repository/tree?private_token=${CONST.token}&path=${path}&ref=release&per_page=100`
  let fileList = []
  const res = await axios.get(url)
  fileList = res.data.filter(item => !filter.includes(item.name))
  return fileList
}
// 读取gitlab文件内容
async function readFileFromGitlab (filePath) {
  const url = `${CONST.GITLAB}/api/v4/projects/${CONST.projectId}/repository/files/${urlencode(filePath)}?private_token=${CONST.token}&ref=release`
  let contentStr
  await axios.get(url).then(res => {
    contentStr = Buffer.from(res.data.content, 'base64')
  })
  return contentStr
}
/**
 *
 * @description 从gitlab下载模板文件
 * @param {String} path 需要读取的文件路径，不传则默认读取最外层
 * @param {String} filter 需要过滤的文件夹/文件名
 */
const getTemplateFromGitLab = async (path = '', filter = [], targetDir) => {
  const fileList = await getFileListFromGitLab(path, filter)
  if (!fs.existsSync(targetDir)) {
    fs.mkdir(targetDir, () => {})
  }

  fileList.forEach(async (item) => {
    // 文件，直接写入
    if (item.type !== 'tree') {
      const gitlabFilePath = path ? `${path}/${item.name}` : `${item.name}`
      const content = await readFileFromGitlab(gitlabFilePath)
      const filePath = path ? `${targetDir}/${path}/${item.name}` : `${targetDir}/${item.name}`
      fs.writeFile(filePath, content, () => {})
    } else {
      // 文件夹，创建文件夹后递归调用
      const targetDirPath = path ? `${targetDir}/${path}/${item.name}` : `${targetDir}/${item.name}`
      fs.mkdir(targetDirPath, err => {})
      const gitlabPath = path ? `${path}/${item.name}` : `${item.name}`
      getTemplateFromGitLab(gitlabPath, filter, targetDir)
    }
  })
}
getTemplateFromGitLab('', ['dist', 'views', 'api', 'router', 'components'], 'targetDir')

// 本地拷贝文件夹
const readOriginToCurrent = (srcPath, targetPath, filter = []) => {
  if (!fs.existsSync(targetPath)) {
    fs.mkdir(targetPath, err => {})
  }
  fs.readdir(srcPath, function(err, files) {
    if (err) {
      console.log(err)
      return
    }
    // 文件列表
    files.forEach(fileName => {
      let fileDir = path.join(srcPath, fileName)
      let filterFlag = filter.some(item => item === fileName)
      if (!filterFlag) {
        // 读文件
        fs.stat(fileDir, function(errs, stats) {
          let isFile = stats.isFile()
          if (isFile) {
            const destPath = path.join(targetPath, fileName)
            // 写入文件
            fs.copyFile(fileDir, destPath, err => {})
          } else {
            // 创建文件夹
            let targetFileDir = path.join(targetPath, fileName)
            fs.mkdir(targetFileDir, err => {})
            // 递归调用
            readOriginToCurrent(fileDir, targetFileDir, filter)
          }
        })
      }
    })
  })
}
readOriginToCurrent('origin', 'target', ['sub'])