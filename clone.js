const chalk = require('chalk')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const processChild = require('child_process')
const ora = require('ora')

const urlRegex = /http[s]{0,1}:\/\/([\w.]+\/?)\S*/

const githubUrl = 'https://github.com'

const proxyUrl = 'https://github.com.cnpmjs.org'

const spinner = ora('loading...')

// 校验仓库的有效性
function checkHubEffective(url) {
  if (!urlRegex.test(url)) {
    console.log(chalk.red('请输入有效仓库地址'))
    process.exit(0)
  }
  if (!url.startsWith(githubUrl) || !url.endsWith('.git')) {
    console.log(chalk.red('请输入有效github仓库地址'))
    process.exit(0)
  }
  const replaceUrl = url.replace(githubUrl, proxyUrl)
  const urls = url.split('/')
  if (urls.length !== 5 || !urls[3] || !urls[4]) {
    console.log(chalk.red('请输入有效github仓库地址'))
    process.exit(0)
  }
  console.log(chalk.green('第一步：校验仓库地址通过'))
  const name = urls[4].slice(0, urls[4].indexOf('.git'))
  axios
    .get(`https://api.github.com/repos/${urls[3]}/${name}`)
    .then((res) => {
      if (res && res.data) {
        console.log(chalk.green('第二步：校验仓库有效性通过'))
        startClone(replaceUrl, urls[3], name)
      }
    })
    .catch((error) => {
      console.log(chalk.red(error))
      process.exit(0)
    })
}

// 开始clone仓库
function startClone(replaceUrl, author, name) {
  spinner.start()
  processChild.exec(`git clone ${replaceUrl}`, function(error, stdout, stderr) {
    spinner.stop()
    if (error) {
      console.log(chalk.red(error))
      process.exit(0)
    }
    console.log(chalk.green('第三步：仓库下载完成'))
    changeGitUrl(author, name)
  })
}

// 修改仓库.git/config地址
function changeGitUrl(author, name) {
  fs.readFile(path.join(process.cwd(), `${name}/.git/config`), 'utf8', function(err, data) {
    if (err) throw err
    fs.writeFile(path.join(process.cwd(), `${name}/.git/config`), data.replace(proxyUrl, githubUrl), 'utf8',
      (err) => {
        if (err) throw err
        console.log(chalk.green('成功'))
      }
    )
  })
}

module.exports = {
  checkHubEffective,
}
