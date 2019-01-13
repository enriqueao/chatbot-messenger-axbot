var request = require("request");

getUserProfile = (psid)=> {
   return new Promise((resolve, reject) => {
       request({
           "uri": `https://graph.facebook.com/${psid}?filelds=first_name,last_name,profile_pi&access_token=${process.env.PAGE_ACCESS_TOKEN}`,
           "method": "GET"
       }, (err, res, body) => {
            resolve(JSON.parse(body.toString()));
       });
   });
}

module.exports= {
    getUserProfile
}