'use strict';
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://esokoletsky:deskjet11@ds133113.mlab.com:33113/workout_app';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://esokoletsky:deskjet11@ds043378.mlab.com:43378/test_workout_app';
exports.PORT = process.env.PORT || 8080;