// config/database.js
module.exports = {

    'url' : 'mongodb://esokoletsky:deskjet11@ds133113.mlab.com:33113/workout_app' // looks like mongodb://<user>:<pass>@mongo.onmodulus.net:27017/Mikha4ot

};

exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://esokoletsky:deskjet11@ds043378.mlab.com:43378/test_workout_app';