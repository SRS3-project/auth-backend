if (!process.env.DB_PREFIX) {
    require('dotenv').config();
}

try{
    const {Firestore} = require('@google-cloud/firestore');
    console.log(`Connecting to firestore...`);

module.exports = new Firestore();

}

catch(err){
    console.log("----------ERRORE DI CONNESSIONE A FIRESTORE----------")
    console.log(err)
}



