import Application from '../LKApplication'
import EventTarget from '../../common/core/EventTarget'
import LKOrgHandler from '../logic/handler/LKOrgHandler'
import LKMagicCodeHandler from '../logic/handler/LKMagicCodeHandler'

class OrgManager extends EventTarget{

    start(){

    }

    asyResetOrgs(newOrgMCode,orgs,userId){
        let curApp = Application.getCurrentApp();
        return LKOrgHandler.asyResetOrgs(orgs,userId).then( () =>{
            return LKMagicCodeHandler.asyUpdateOrgMagicCode(newOrgMCode,userId);
        }).then( ()=>{
            curApp.setOrgMagicCode(newOrgMCode);
            this.fire("orgChanged");
        });
    }

}


module.exports = new OrgManager();
