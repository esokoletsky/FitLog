'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
mongoose.promise = global.Promise;

const should = chai.should();

const { TEST_DATABASE_URL } = require('../config/database');
const { Exercise } = require("../app/models/exercise");
const {app, runServer, closeServer} = require('../server');

chai.use(chaiHttp);

function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

function seedDatabase(){
    return seedExcercises();
  }


function seedExcercises() {
  console.info('seeding exercises');
  const seedData = [];
  for (let i = 1; i <= 10; i++){ 
  seedData.push({
    day: faker.lorem.text(),
    muscleGroup: faker.lorem.text(),
    muscle: faker.lorem.text(),
    name: faker.lorem.text(),
    weight: faker.random.number(),
    sets: faker.random.number(),
    reps: faker.random.number(),
   });
}
 return Exercise.insertMany(seedData);
}

describe('Exercise API resource', function () {

  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function () {
    return seedDatabase();
  });

  afterEach(function () {

    return tearDownDb();
  });

  after(function () {
    return closeServer();
  });

describe('GET endpoints', function () {

  it('should return all existing exercises', function () {
    let res;
    return chai.request(app)
      .get('/exercises')
      .then(_res => {
        res = _res;
        res.should.have.status(200);
        res.body.exercises.should.have.lengthOf.at.least(1);

        return Exercise.count();
      })
      .then(count => {
        res.body.exercises.should.have.lengthOf(count);
      });
  });

  it('should return exercises with right fields', function () {

    let resPost;
    return chai.request(app)
      .get('/exercises')
      .then(function (res) {

        res.should.have.status(200);
        res.should.be.json;
        res.body.exercises.should.be.a('array');
        res.body.exercises.should.have.lengthOf.at.least(1);
        res.body.exercises.forEach(function (post) {
        post.should.be.a('object');
        post.should.include.keys('id', 'day', 'muscleGroup', 'muscle', 'name', 'weight', 'sets', 'reps');
        });
        resPost = res.body.exercises[0];
        return Exercise.findById(resPost.id);
      })
      .then(post => {
        resPost.id.should.equal(post.id);
        resPost.day.should.equal(post.day);
        resPost.muscleGroup.should.equal(post.muscleGroup);
        resPost.muscle.should.equal(post.muscle);
        resPost.name.should.equal(post.name);
        resPost.weight.should.equal(post.weight);
        resPost.sets.should.equal(post.sets);
        resPost.reps.should.equal(post.reps);
      });
  });
});


describe('POST endpoint', function () {

  
  it('should add a new exercise routine', function () {

    const newRoutine = {
      day: faker.lorem.text(),
      muscleGroup: faker.lorem.text(),
      muscle: faker.lorem.text(),
      name: faker.lorem.text(),
      weight: faker.random.number(),
      sets: faker.random.number(),
      reps: faker.random.number(),
    };

    return chai.request(app)
      .post('/exercises')
      .set('content-type', 'application/json')
      .send(newRoutine)
      .then(function (res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys 
        ( 'id', 'day', 'muscleGroup', 'muscle', 'name', 'weight', 'sets', 'reps' );
        res.body.day.should.equal(newRoutine.day);
        res.body.id.should.not.be.null;
        res.body.muscleGroup.should.equal(newRoutine.muscleGroup);
        res.body.muscle.should.equal(newRoutine.muscle);
        res.body.name.should.equal(newRoutine.name);
        res.body.weight.should.equal(newRoutine.weight);
        res.body.sets.should.equal(newRoutine.sets);
        res.body.reps.should.equal(newRoutine.reps);
        return Exercise.findById(res.body.id);
      })
      .then(function (post) {
        post.day.should.equal(newRoutine.day);
        post.muscleGroup.should.equal(newRoutine.muscleGroup);
        post.muscle.should.equal(newRoutine.muscle);
        post.name.should.equal(newRoutine.name);
        post.weight.should.equal(newRoutine.weight);
        post.sets.should.equal(newRoutine.sets);
        post.reps.should.equal(newRoutine.reps);
      });
  });

});

describe('PUT endpoints', function() {

it('should update fields in your exercise send over', function() {
  const updateData = {
    day: 'Monday',
    muscleGroup: 'arms',
    muscle: 'bicep',
    name: 'curl',    
    weight: 100,
    sets: 3,
    reps: 12
  };

  return Exercise
    .findOne()
    .then(exercise => {
      updateData.id = exercise.id;

      return chai.request(app)
      .put(`/exercises/${exercise.id}`)
      .send(updateData);
    })
    .then(res => {
      res.should.have.status(204);
      return Exercise.findById(updateData.id);
    })
    .then(exercise => {
      exercise.day.should.equal(updateData.day);
      exercise.muscleGroup.should.equal(updateData.muscleGroup);
      exercise.muscle.should.equal(updateData.muscle);
      exercise.name.should.equal(updateData.name);
      exercise.weight.should.equal(updateData.weight);
      exercise.sets.should.equal(updateData.sets);
      exercise.reps.should.equal(updateData.reps);
    });
 });

});
});