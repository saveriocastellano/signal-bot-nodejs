const { default: axios } = require("axios");
const SignalBot = require("./SignalBot");


(async ()=>{
    
    let bot = new SignalBot({account: '+34613962849'});

    bot.on('connected', ()=> {
        console.log("connected!");
    });

    bot.on('disconnected', ()=> {
        console.log("disconnected!");
    });

    bot.on('connectionError', e => {
        console.error("connection error! " + e.message);
    });

    bot.on('joinGroupInvite', msg =>{
        console.log("Invite to JOIN group: " + JSON.stringify(msg));
        setTimeout(async ()=> {
           let res =     await bot.joinGroupInvite(msg.dataMessage.previews[0].url);
           console.log("invite joined res: " + JSON.stringify(res.data));
        }, 1500);
    });

    bot.on('groupMessage', msg =>{
        console.log("MSG from group: " + JSON.stringify(msg));

        setTimeout(async ()=> {
            let res = await bot.sendGroupMessage(msg.dataMessage.groupInfo.groupId, msg.dataMessage.message);
            console.log("send msg: " + JSON.stringify(res.data));
        }, 1500);        
    });
    
    bot.on('privateMessage', msg =>{
        console.log("MSG private: " + JSON.stringify(msg));
        setTimeout(async ()=> {
            let res = await bot.sendPrivateMessage(msg.source, msg.dataMessage.message);
            console.log("send msg: " + JSON.stringify(res.data));
        }, 1500);

    });

}) ();
