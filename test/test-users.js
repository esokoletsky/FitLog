'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
mongoose.promise = global.Promise;

const should = chai.should();

const { TEST_DATABASE_URL } = require('../config/database');
const  User  = require("../app/models/user");
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
    return seedUsers();
    }
  
  
  function seedUsers(){
    console.info('seeding users');
    const seedData = [];
    for (let i = 1; i <= 10; i++) {
      seedData.push({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password()
      });
    }
    return User.insertMany(seedData);
  }

  describe('Client Exercise API resource', function () {

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
  
    it('should return an individual user id', function () {
      let user;
      return User
      .findOne()
      .then(_user => {
        user = _user;
        return chai.request(app).get(`/users/${user.id}`);
      })
      .then(res => {
        res.should.have.status(201);
        res.body.id.should.equal(user.id);
        res.body.clientName.should.equal(`${user.firstName} ${user.lastName}`.trim());
        res.body.email.should.equal(user.email);
      })
  
  
    })
  
    it('should return users with right fields', function () {
  
      let res;
      return chai.request(app)
        .get('/users')
        .then(function (_res) {
          res = _res;
          res.should.have.status(200);
          res.should.be.json;
          res.body.users.should.be.a('array');
          res.body.users.should.have.lengthOf.at.least(1);
          res.body.users.forEach(function (user) {
            user.should.be.a('object');
            user.should.include.keys('clientName', 'email', 'id' );
          });
          
          return User.count();
        })
        .then(count => {
          res.body.users.should.have.lengthOf(count);
        });
    });
  });
  
  describe('POST endpoint', function () {
  
    it('should add a new user', function () {
  
      const newUser = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password()
      };
  
      return chai.request(app)
        .post('/users')
        .set('content-type', 'application/json')
        .send(newUser)
        .then(function (res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys 
          ( 'id', 'clientName', 'email' );
          res.body.email.should.equal(newUser.email);
          res.body.id.should.not.be.null;
          res.body.clientName.should.equal(
            `${newUser.firstName} ${newUser.lastName}`);
          return User.findById(res.body.id);
        })
        .then(function (user) {
          user.email.should.equal(newUser.email);
          user.firstName.should.equal(newUser.firstName);
          user.lastName.should.equal(newUser.lastName);
        });
    });
  
  });
  
  describe('PUT endpoints', function() {
  
   it('should update fields in your User send over', function() {
     const updateData = {
       firstName: 'Joe',
       lastName: 'Shmoe',
       email: 'JShmoe'
     };
  
     return User
      .findOne()
      .then(user => {
        updateData.id = user.id;
  
        return chai.request(app)
        .put(`/users/${user.id}`)
        .send(updateData);
      })
      .then(res => {
        res.should.have.status(204);
        return User.findById(updateData.id);
      })
      .then(user => {
        user.firstName.should.equal(updateData.firstName);
        user.lastName.should.equal(updateData.lastName);
        user.email.should.equal(updateData.email);
      });
   });
  });
});