const NodeSSH = require('node-ssh')
const config = require('../config/devConfig')
const path = require('path')
const rootDir = path.resolve(__dirname, '..')
const appJSONPath = path.resolve(rootDir, 'lk/app.json')
const {DateUtil} = require('@ys/vanilla')
const {getTimeDisplay} = DateUtil
const fs = require('fs')

class util {
  static upload ({local, remote}) {
    return new Promise(async (resolve) => {
      const option = {
        host: config.ip,
        username: config.sshInfo.username,
        password: config.sshInfo.password
      }
      const ssh = new NodeSSH()
      await ssh.connect(option)
      ssh.putFiles([{local, remote}]).then(() => {
        console.log(`upload ${local} to ${remote} in the server`)
        resolve()
        ssh.dispose()
      },
      (error) => {
        console.log("Something's wrong")
        console.log(error)
        ssh.dispose()
      })
    })
  }
  static timeStamp (option) {
    const obj = {
      packTime: getTimeDisplay(),
      ...option
    }
    fs.writeFileSync(appJSONPath, JSON.stringify(obj))
  }
}

Object.freeze(util)
module.exports = util
