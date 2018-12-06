const   User  = require('./models/user');
const { Exercise } = require("./models/exercise");

// app/routes.js
module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    // app.post('/login', do all our passport stuff here);
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/user-exercises', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    // app.post('/signup', do all our passport stuff here);
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    
    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // =====================================
    // Exercise & User endpoints ===========
    // =====================================
   

    app.get('/users', (req, res) => {
        User
          .find()
          .then(users => {
            res.status(200).json({users: users.map(user => user.serialize())}
            );
          })
          .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'something went terribly wrong' });
            
          });
      });
    
    app.get('/users/:id', (req, res) => {
        User
          .findById(req.params.id)
          .then(user => res.status(201).json(user.serialize()))
          .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'something went terribly wrong' });
          });
      });
    
      app.get('/exercises', (req, res) => {
        Exercise
          .find()
          .then(exercises => {
            res.json({exercises: exercises.map(exercise => exercise.serialize())}
            );
          })
          .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'something went terribly wrong' });
          });
      });

      app.get('/user-exercises', isLoggedIn, (req, res) => {
        Exercise
          .find({user: req.user._id})
          .then(exercises => {
            res.render('user-exercises.ejs',{
              user: req.user,
              exercises: exercises
            });
            //res.json({exercises: exercises.map(exercise => exercise.serialize())});
          })
          .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'something went terribly wrong' });
          });
      });

      app.get('/delete-exercise/:id', isLoggedIn, (req, res) => {
        Exercise
          .findOneAndRemove({_id: req.params.id, user: req.user._id })
          .then(() => {
            //res.status(204).json({ message: 'success' });
            res.redirect('/user-exercises');
          })
          .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'something went terribly wrong' });
          });
      });

      app.get('/edit-exercise/:id', isLoggedIn, (req, res) => {
        Exercise
          .findOne({_id: req.params.id, user: req.user._id })
          .then((exercise) => {
            if(exercise){
              res.render('edit-exercise.ejs',{user: req.user,exercise: exercise});
            } else {
              res.status(404).json({ message: 'not found' });
            }
          })
          .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'something went terribly wrong' });
          });
      });

      
    
      app.post('/users', isLoggedIn, (req, res) => {
        const requiredFields = [ 'firstName','lastName', 'email' ];
        for (let i = 0; i < requiredFields.length; i++) {
          const field = requiredFields[i];
          if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
          }
        }
      
        User
          .create(req.body)
          .then(user => res.status(201).json(user.serialize()))
          .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Something went wrong' });
          });
      
      });
    
      app.post('/exercises', isLoggedIn, (req, res) => {
        const requiredFields = ['day', 'muscleGroup', 'muscle', 'name', 'weight', 'sets', 'reps' ];
        for (let i = 0; i < requiredFields.length; i++) {
          const field = requiredFields[i];
          if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
          }
        }
        req.body.user = req.user._id;
      
           Exercise
          .create(req.body)
          .then(exercise => {
            res.redirect('/user-exercises');
             //res.status(201).json(exercise.serialize())
          })
          .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Something went wrong' });
          });
      
      });

      app.post('/update-exercise/:id', isLoggedIn, (req, res) => {
        const requiredFields = ['day', 'muscleGroup', 'muscle', 'name', 'weight', 'sets', 'reps' ];
        for (let i = 0; i < requiredFields.length; i++) {
          const field = requiredFields[i];
          if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
          }
        }
      
           Exercise
          .findOneAndUpdate({_id:req.params.id,user:req.user._id},{$set:req.body})
          .then(exercise => {
            res.redirect('/user-exercises');
             //res.status(201).json(exercise.serialize())
          })
          .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Something went wrong' });
          });
      
      });
    
      app.put('/users/:id', (req,res) => {
        if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
          res.status(400).json({
            error: 'Request path id and request body id values must match'
          });
        }
    
        const updated = {};
        const updatableFields = ['firstName', 'lastName', 'email'];
        updatableFields.forEach(field => {
          if (field in req.body) {
            updated[field] = req.body[field];
          }
        });
        User
          .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
          .then(updateUser => res.status(204).end())
          .catch(err => res.status(500).json({ message: 'something went wrong' }));
      });
    
      app.put('/exercises/:id', (req,res) => {
        if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
          res.status(400).json({
            error: 'Request path id and request body id must match'
          });
        }
    
        const updated = {};
        const updatableFields = [ 'day', 'muscleGroup', 'muscle', 'name', 'weight', 'sets', 'reps' ];
        updatableFields.forEach(field => {
          if (field in req.body) {
            updated[field] = req.body[field];
          }
        });
        Exercise
          .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
          .then(updateExercise => res.status(204).end())
          .catch(err => res.status(500).json({ message: 'something went wrong' }));
      });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

