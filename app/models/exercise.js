'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const exerciseSchema = mongoose.Schema(
{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },    
    day: {type: "string", required: true },
    muscleGroup: {type: "string", required: true },
    muscle: {type: "string", required: true },
    name: {type: "string", required: true },    
    weight: {type: "number", required: true },
    sets: {type: "number", required: true },
    reps: {type: "number", required: true }

});

exerciseSchema.methods.serialize = function() {
    return {
      id: this._id,
      day: this.day,
      muscleGroup: this.muscleGroup,
      muscle: this.muscle,
      name: this.name,    
      weight: this.weight,
      sets: this.sets,
      reps: this.reps
    };
    }; 

    exerciseSchema.pre('find', function(next) {
        this.populate('user');
        next();
      });
      
      exerciseSchema.pre('findOne', function(next) {
        this.populate('user');
        next();
      });

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = {Exercise};