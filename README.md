# signal-bot-nodejs
Simple experimental NodeJS Signal bot based on signal-cli

This is NOT a complete bot, it's basically only a proof-of-concept that shows how to create a simple NodeJS bot for Signal.

The bot requires you to run `signal-cli` in HTTP daemon mode (signal-cli daemon --http). It uses signal-cli RPC endpoint
for Signal API calls (e.g. send messages) and signal-cli SSE (Server-Sent-Event) to receive the stream of events from Signal.

The main bot class SignalBot.js connects to signal-cli daemon. I suggest you to use this patched version of signal-cli as it
fixes an issue that allows receiving message for a specific account (which is done by calling the `/api/v1/events` with 
`account` querystring parameter):

https://github.com/saveriocastellano/signal-cli

# Usage #

Look at `run.js` to understand how to use the SignalBot class. Here is how the code looks like:

```
    let bot = new SignalBot({account: '+38124962777'});

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
```
