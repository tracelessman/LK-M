import db from '../../common/store/DataBase'
const {commonUtil} = require('@external/common')
const {getAvatarSource} = commonUtil
const defaultAvatar = require('../view/image/defaultAvatar.png')
const util = {
  getAvatarSource (pic) {
    return getAvatarSource(pic, defaultAvatar)
  },
  async showAll (tableName) {
    let sql = `select * from ${tableName}`
    const ary = await this.query(sql)

    const obj = {}
    obj[tableName] = ary
    console.log(obj)
  },
  query (sql) {
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
  },
  async removeAllGroup () {
    let sql = `delete  from chat`
    await this.query(sql)
    sql = 'delete from groupMember'
    await this.query(sql)
    console.log('all group chat deleted')
  }
}

const tableAry = [
  // 'device', 'mfapply', 'contact', 'record',
  // 'chat', 'groupMember'
  'record'
]

;(async () => {
  // const friendAry = await util.query('select * from contact where relation=1')
  // console.log({friendAry})
  // await util.removeAllGroup()
  for (let ele of tableAry) {
    util.showAll(ele)
  }
})()

Object.freeze(util)

module.exports = util
