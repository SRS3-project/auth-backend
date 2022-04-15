if (!process.env.DB_PREFIX) {
    require('dotenv').config();
}
const {Firestore} = require('@google-cloud/firestore');

console.log(`Connecting to firestore...`);

module.exports = new Firestore();
