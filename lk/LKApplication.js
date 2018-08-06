import Application from '../engine/Application'
import ConfigManager from '../common/core/ConfigManager'

class LKApplication extends Application{

    constructor(name){
        super(name);
    }

    setCurrentUser(user){
        super.setCurrentUser(user);
        let url=user?'ws://'+user.serverIP+':'+user.serverPort:null;
        if((!this._channel)||(this._channel.getUrl()!=url)){
            if(this._channel){
                this._channel.close();
                delete this._channel;
            }
            if(url)
                this._channel = new (ConfigManager.getWSChannel())('ws://'+user.serverIP+':'+user.serverPort,true);

        }
        if(this._channel) {
            this._channel.applyChannel().then((channel)=>{
                return channel.asyLogin(user.id,user.password);
            })
        }
    }

    asyRegister(user,venderDid,checkCode,qrcode,description){
        let channel = new (ConfigManager.getWSChannel())('ws://'+user.serverIP+':'+user.serverPort,true);
        return new Promise((resolve,reject)=>{
            channel.asyRegister(user.serverIP,user.serverPort,user.id,user.deviceId,venderDid,user.publicKey,checkCode,qrcode,description).then(function (msg) {
                let content = msg.body.content;
                if(content.error){
                    reject(content.error);
                }else{
                    let serverPK = content.publicKey;
                    let orgMCode = content.orgMCode;
                    let orgs = content.orgs;
                    let memberMCode = content.memberMCode;
                    let members = content.members;
                    let friends = content.friends;
                    ConfigManager.getOrgManager().asyResetOrgs(orgMCode,orgs).then(function () {
                        return ConfigManager.getContactManager().asyResetContacts(memberMCode,members,friends,user.id)
                    }).then(function () {
                        user.serverPublicKey = serverPK;
                        return ConfigManager.getUserManager().asyAddLKUser(user);
                    }).then(function () {
                        resolve();
                    })

                }


            });
        })

    }

    asyUnRegister(){
        const p = this._channel.asyUnRegister()
         const p2 = p.then( ()=> {
            //TODO 删除数据、清除缓存
             ConfigManager.getUserManager().asyRemoveLKUser(this.getCurrentUser().id);
            this.setCurrentUser(null);

        })
        return p2
    }


    getLKWSChannel(){
        return this._channel;
    }


    setOrgMagicCode(code){
        this._orgMCode = code;
    }

    setMemberMagicCode(code){
        this._memberMCode = code;
    }

    async asyGetOrgMCode(){
        if (!this._orgMCode) {
            this._orgMCode = await this._lkMagicCodeProvider.asyGetMagicCode(this.getCurrentUser().id).orgMCode;
        }
        return this._orgMCode;
    }

    async asyGetMemberMCode(){
        if (!this._memberMCode) {
            this._memberMCode = await this._lkMagicCodeProvider.asyGetMagicCode(this.getCurrentUser().id).memberMCode;
        }
        return this._memberMCode;
    }

    setMessageTimeout(timeout){
        this._messageTimeout = timeout;
    }

    getMessageTimeout(){
        return this._messageTimeout;
    }

}
new LKApplication("LK");
module.exports = LKApplication;
