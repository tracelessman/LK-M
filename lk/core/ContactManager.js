import Application from '../LKApplication'
import EventTarget from '../../common/core/EventTarget'
import LKContactHandler from '../logic/handler/LKContactHandler'
import LKMagicCodeHandler from '../logic/handler/LKMagicCodeHandler'
class ContactManager extends EventTarget{

    start(){

    }

    notifyContactMCodeChanged(detail){
        //TODO change database
        this.fire("mCodeChanged",detail);
    }

    notifyContactDeviceAdded(detail){
        //TODO
        this.fire("deviceAdded",detail);
    }

    notifyContactDeviceRemoved(detail){
        //TODO
        this.fire("deviceRemoved",detail);
    }

    asyResetContacts(newMemberMCode,members,friends){
        let curApp = Application.getCurrentApp();
        return  LKContactHandler.asyResetContacts(members,friends,curApp.getCurrentUser().id).then(function () {
            return LKMagicCodeHandler.asyUpdateMemberMagicCode(newMemberMCode,curApp.getCurrentUser().id);
        }).then(function () {
            curApp.setMemberMagicCode(newMemberMCode);
            this.fire("contactChanged");
        });
    }
}


module.exports = new ContactManager();