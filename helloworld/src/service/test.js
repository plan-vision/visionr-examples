#!/usr/bin/env vr run

const express = require('express');
const app = express();
const {createExpressServer,call} = require("@visionr/cli/webservice"); // service api helpers
//-------------------------------------------------------------------------
// WEBAPP (extress http server)
//-------------------------------------------------------------------------
createExpressServer(app);
//-------------------------------------------------------------------------
// ROUTES
//-------------------------------------------------------------------------
app.get('/test/best', test1); 
app.get('/status', status);

//-------------------------------------------------------------------------
await new Promise(()=>{}); // wait, do not close the process 
//-------------------------------------------------------------------------
async function test1(req, res) {  
    var r = await call(req, function(val){
        /* SERVER JS */
        const misc = require("server/misc");
        return {
            user : session.user.code,
            person : session.user.person?.toString(),
            val : val,
            lang : session.lang.code,
            testI18n : db.MSG("INFO_WELCOME"),
            NOW : misc.formatDatetime(new Date()),
            number : misc.formatDouble(123456789.67821)
        }
    },/*args*/123);
    res.send(`RESULT : ${JSON.stringify(r,null,4)}`);
}

async function status(req, res) {  
    var r = await call(req, function(val){
        /* SERVER JS */
        const misc = require("server/misc");
        return {
            user : session.user.code,
            person : session.user.person?.toString(),           
            NOW : misc.formatDatetime(new Date()),
            loggedIn : session.loggedIn,
            platform : session.platform
        }
    },/*args*/123);
    res.send(`STATUS : ${JSON.stringify(r,null,4)}`);
}