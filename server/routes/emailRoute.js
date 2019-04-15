var bCrypt = require('bcrypt-nodejs');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var emailCollection = require('../models/userEmail');




router.use(passport.initialize());
router.use(passport.session());
passport.serializeUser(function(user, done) {
    done(null, user._id);
});
passport.deserializeUser(function(id, done) {
    userCollection.findById(id, function(err, user) {
        done(err, user);
    });
});
var isValidPassword = function(user, password){
    return bCrypt.compareSync(password, user.password);
};
var createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};


router.get('/', (req,res)=> {
   if(req.session.username){
       res.send(req.session.username);
   } else{
       res.send(null);
   }
});

router.get('logout', (req, res,)=>{
    if(req.session){
        req.session=null;
        res.send('logged Out Yo');
    } else{
        res.send('Not Logged in');
    }

});


//strategy for checking a user
passport.use(new LocalStrategy(
    function(username, password, done) {
        console.log("Local Strat");
        userCollection.findOne({ username: username }, function (err, user) {
            if (err) { console.log("1");
                return done(err); }
            if (!user) {
                console.log("2");
                return done(null, false, { message: 'Incorrect username.' });
            }
            // if (!user.validPassword(password)) {
            if (!isValidPassword(user, password)) {
                console.log("3");
                return done(null, false, { message: 'Incorrect password.' });
            }
            console.log("4");
            console.log(user);
            return done(null, user, { user: user.username });
        });
    }
));

router.post('login',
    passport.authenticate('local',{failureRedirect: 'users/loginfail'}),

    function(req, res){
    req.session.username=req.body.username;
    res.send(req.body.username);
    });

router.get('loginsuccess', (req,res)=>{
   res.send(undefined)
});


//strategy for user sign up

passport.use('signup', new LocalStrategy({
    passReqToCallback: true},
    function(req, username, password, done){
    findorCreateUser = function(){
       emailCollection.findOne({'username': username}, function (err,user) {
           if(err){
               return done(err);
           }
           if (user){
               return done(null, false,
                   {message: 'Username is taken'});

           } else{
               var newUser = new emailCollection();
               newUser.username = username;
               newUser.password = createHash(password);
               newUser.email = req.param('email');

               newUser.save(function (err) {
                   if(err){
                       throw err;
                   }
                   return done(null, newUser);
               });
           }
       });
    };
    process.nextTick(findorCreateUser);
    })
);
router.post('/newuser',
    passport.authenticate('signup',
        {successRedirect: 'users/successNewUser',
        failureRedirect:'/users/failNewUser'
        }
        ),
    function (req,res) {
    res.send("Authenticated");
    });

router.get('/successNewUser', (req, res)=>{
   console.log('failed new user')
});


module.exports=router;