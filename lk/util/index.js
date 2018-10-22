import db from '../../common/store/DataBase'
import {Toast} from 'native-base'
const {commonUtil} = require('@external/common')
const lkApp = require('../LKApplication').getCurrentApp()
const {getAvatarSource} = commonUtil
const defaultAvatar = require('../view/image/defaultAvatar.png')
const container = require('../state')
class Util{
   static getAvatarSource (pic) {
    return getAvatarSource(pic, defaultAvatar)
  }
  static addExternalFriend ({navigation}) {
    navigation.navigate('ScanView', {
      onRead (e) {
        const {data} = e
        const {action, code, ip, port, id} = JSON.parse(data)
        console.log(data)
        if (code === 'LK' && action === 'addFriend') {
          lkApp.getLKWSChannel().applyMF(id, ip, port)
          Toast.show({
            text: '好友请求已成功发送!',
            position: 'top',
            type: 'success',
            duration: 3000
          })
        } else {
          Toast.show({
            text: '该二维码无效,请核对后重试!',
            position: 'top',
            type: 'warning',
            duration: 3000
          })
        }
      }
    })
  }
  static async showAll (tableName) {
    let sql = `select * from ${tableName}`
    const ary = await Util.query(sql)

    const obj = {}
    obj[tableName] = ary
    console.log(obj)
  }
  static query (sql) {
    return new Promise(resolve => {
      db.transaction((tx) => {
        tx.executeSql(sql, [], function (tx2, results) {
          let ary = []
          for (let i = 0; i < results.rows.length; i++) {
            ary.push(results.rows.item(i))
          }
          resolve(ary)
        }, function (err) {
          console.log(err)
        })
      })
    })
  }
  static removeAllGroup () {
    return Util.deleteTable([''])
  }
  static deleteTable (tableName) {
    if (Array.isArray(tableName)) {
      const promiseAry = []
      for (let ele of tableName) {
        promiseAry.push(Util._deleteTable(ele))
      }
      return Promise.all(promiseAry)
    } else {
      return Util._deleteTable(tableName)
    }
  }
  static _deleteTable (tableName) {
    const sql = `delete from ${tableName}`
    return Util.query(sql)
  }
  // todo: should be putinto net channell
  static runNetFunc (func) {
    const {connectionOK, NetInfoUtil} = container.state
    if (connectionOK) {
      func()
    } else {
      if (NetInfoUtil.online) {
        Toast.show({
          text: '无法连接服务器',
          position: 'top'
        })
      } else {
        Toast.show({
          text: '您的连接已断开,请检查网络设置',
          position: 'top'
        })
      }
    }
  }
}

const tableAry = [
  // 'device', 'mfapply', 'contact', 'record',
  // 'chat', 'groupMember'
  'record'
]

;(async () => {
  // const friendAry = await Util.query('select * from contact where relation=1')
  // console.log({friendAry})
  // await Util.removeAllGroup()
  for (let ele of tableAry) {
    Util.showAll(ele)
  }
})()

Object.freeze(Util)

module.exports = Util
