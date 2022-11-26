const { rejects } = require('assert');

module.exports = {
    validatePhoneNumber: function(num){
            var re = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g;
            return re.test(num);
    },
    validateData: function(data){
        const body = data.body;
        const phoneNumber = data.phoneNumber;
        return body.length > 0 && this.validatePhoneNumber(phoneNumber);
    }, 
    getAllMessageHistory: async function(){
        const fs = require('fs');
        return new Promise((resolve, reject ) => {
            fs.readFile('./messageHistoryDB.json', (err, data) => {
                if(err){
                    return console.log(`Error trying to get message history: ${err}`);
                }
                try{
                    const parseData = JSON.parse(data); 
                    resolve(parseData);
                }catch(err){
                    console.log(`Error trying to parse messages JSON: ${err}`);
                    reject(err);
                }
            })
        })
    }, 
    addNewMessage: async function(data){
        const fs = require('fs');
        const messageId = new Date().getTime(); 
        const messageData = {
            message: data.body, 
            phone: data.phoneNumber, 
            date: new Date()
        }
        this.getAllMessageHistory().then(data => {
            debugger;
            return new Promise((resolve, reject) => {
                fs.writeFile('./messageHistoryDB.json', JSON.stringify({...data, [messageId]: messageData}, null, 2), (err) => {
                    if(err){
                        console.log(`Error writing to messages DB: ${err}`); 
                        reject(err); 
                    }
                    resolve({success: true})
                })
            })
        })
    }
}