const path = require('path')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const Generator = require('./Generator')

module.exports = async function (name, options) {
    // 当前命令选择的文件夹
    const cwdUrl = process.cwd()
    // 要创建的目录地址
    const targetDirUrl = path.join(cwdUrl,name) 

    // 判断目录是否已经存在
    if(fs.existsSync(targetDirUrl)){
        if(options.force){
            // 移除旧文件夹
            await fs.remove(targetDirUrl)
        }else{
            // 询问是否要覆盖
            const { action } = await inquirer.prompt([
                {
                    type:'list',
                    name:'action',
                    message:'当前存在同名文件夹，请选择覆盖或取消',
                    choices:[
                        {
                            name: 'Overwrite',
                            value: 'overwrite'
                        },{
                            name: 'Cancel',
                            value: false
                        }
                    ]
                }
            ])
            // 取消
            if(!action){
                return
            }else if(action==='overwrite'){
                // 移除已存在的目录
                console.log(`\r\nRemoving...`)
                await fs.remove(targetDirUrl)
            }
        }
    }
    // 创建项目
    const generator = new Generator(name,targetDirUrl)


    // 开始创建
    generator.create()
}