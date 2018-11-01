const devConfig = require('../config/devConfig')
const {FuncUtil} = require('@ys/vanilla')
const {timeCount} = FuncUtil
const childProcess = require('child_process')
const NodeSSH = require('node-ssh')
const ssh = new NodeSSH()
const config = require('../config/devConfig')
const path = require('path')
const {exportPPKFolderPath, serverRoot,appName} = config
const fileName = `${appName}.ppk`
const outputPath = `${exportPPKFolderPath}/${fileName}`
start()

function start () {
  const cmd = `npx pushy bundle --platform ios --verbose --output ${outputPath}`

  timeCount(async () => {
    console.log('ppk export started')
    console.log({cmd})
    childProcess.execSync(cmd)

    console.log('ppk export end')
    const option = {
      host: config.ip,
      username: config.sshInfo.username,
      password: config.sshInfo.password
    }
    await ssh.connect(option)
    const remotePath = path.resolve(serverRoot, `static/public/ppk/${fileName}`)
    // console.log(remotePath)

    return new Promise(resolve => {
      ssh.putFiles([{local: outputPath, remote: remotePath}]).then(() => {
        resolve()
        ssh.dispose()
      },
      (error) => {
        console.log("Something's wrong")
        console.log(error)
        ssh.dispose()
      })
    })
  })

  // clipboardy.writeSync(cmd)
}
