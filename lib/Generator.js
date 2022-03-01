const { getRepoList } = require('./http')
const ora = require('ora')
const inquirer = require('inquirer')
const util = require('util')
const downloadGitRepo = require('download-git-repo') // 不支持 Promise
const path = require('path')
const chalk = require('chalk')

async function wrapLoading(fn,message,...args){
    // 使用ora初始化，传入提示信息
    const spinner = ora(message)
    // 开始加载动画
    spinner.start()
    
    try {
        // 执行传入的方法fn
        const result = await fn(...args)
        // 将spinner状态修改为成功
        spinner.succeed()
        return result
    } catch {
        // 将spinner状态修改为失败
        spinner.fail('请求失败，请重试')
    }
}

class Generator {
    constructor(name,targetDir){
        this.name = name
        this.targetDir = targetDir
        // 对 download-git-repo 进行 promise 化改造
        this.downloadGitRepo = util.promisify(downloadGitRepo)
    }

    async getRepo() {
        // 从远程拉取模板数据
        const repoList = await wrapLoading(getRepoList,'waiting fetch template')
        if(!repoList){
            console.log('无法获取模板信息',repoList)
            return
        }
        // 过滤我们需要的模板名
        const repos = repoList.map( item => item.name )
        // 用户选择自己想要下载的模板名称
        const { repo } = await inquirer.prompt([
            {
                type:'list',
                name:'repo',
                message:'请选择模板',
                choices:repos
            }
        ])
        // 返回用户选择的模板名称
        return repo
    }

    async download(repo){
        // 下载地址
        const resultUrl = `LIBINY/${repo}`
        // 调用下载方法
        await wrapLoading(this.downloadGitRepo,'模板加载中......',resultUrl,this.targetDir)
    }

    /**
     * 1、获取模板名称
     * 2、获取tag版本
     * 3、下载模板到目标目录
     */
    async create(){
        const repo = await this.getRepo()
        // 下载模板到模板目录
        await this.download(repo)
        // 模板使用提示
        console.log(`\r\nSuccessfully created project ${chalk.cyan(this.name)}`)
        console.log(`\r\n  cd ${chalk.cyan(this.name)}`)
        console.log('  npm run dev\r\n')
    }
}

module.exports = Generator