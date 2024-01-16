/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const express = require("express");
const app = express();
const { Todo, User } = require("./models");

// password hash
const bcrypt = require('bcrypt')
const saltRounds = 10;

//authentication
const passport = require('passport')
const connectEnsureLogin = require('connect-ensure-login')
const session = require('express-session')
const LocalStrategy = require('passport-local')

const flash = require("connect-flash");

const path = require("path");
app.set("views", path.join(__dirname, "views"));
app.use(flash());

//protect CSRF
var csrf = require('tiny-csrf')
var cookieParser = require('cookie-parser')

//for use json file
const bodyParser = require("body-parser");
app.use(bodyParser.json());

//for use ejs file
app.set("view engine", "ejs");

//for css
app.use(express.static("public"));

//for form post request
app.use(express.urlencoded({ extended: false }));

//Csrf
app.use(cookieParser("shh! some secret string"))
app.use(csrf(
    "this_should_be_32_character_long", ["POST", "PUT", "DELETE"]
))

//autentication
app.use(session({
    secret: "my-super-secret-key-1233243254645735",
    cookie: {
        maxAge: 24 * 60 * 60 * 1000
    },
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize());
app.use(passport.session());

// flash_message
app.use(function (request, response, next) {
    response.locals.messages = request.flash();
    next();
});

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, (username, password, done) => {
    User.findOne({
        where: {
            email: username,
        }
    })
        .then(async (user) => {
            const result = await bcrypt.compare(password, user.password)
            if (result) {
                return done(null, user)
            } else {
                return done(null, false, { message: "Invalid password" });
            }

        }).catch((error) => {
            return done(null, false, { message: "Invalid email" });
        })
}))

passport.serializeUser((user, done) => {
    console.log("Serilizing user in session", user.id);
    done(null, user.id)
})

passport.deserializeUser((id, done) => {
    User.findByPk(id)
        .then(user => {
            done(null, user)
        })
        .catch(error => {
            done(error, null)
        })
})

app.get("/", async function (request, response) {
    response.render("index", {
        title: "Todo Application",
        csrfToken: request.csrfToken(),
    });
});

app.get("/todos", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
    const loggedInUser = request.user.id
    const allTodos = await Todo.getTodos();
    const overdue = await Todo.overdue(loggedInUser);
    const dueToday = await Todo.dueToday(loggedInUser);
    const dueLater = await Todo.dueLater(loggedInUser);
    const completedItems = await Todo.completedItems(loggedInUser);

    if (request.accepts("html")) {
        response.render("todos", {
            title: "Todo Application",
            overdue,
            dueToday,
            dueLater,
            allTodos,
            completedItems,
            csrfToken: request.csrfToken(),
        });
    } else {
        response.json({
            overdue,
            dueToday,
            dueLater,
            completedItems
        });
    }
});

app.get('/signup', (request, response) => {
    response.render("signup", {
        title: "Sign Up",
        csrfToken: request.csrfToken(),
    })
})

app.get("/signout", (request, response, next) => {
    request.logout((err) => {
        if (err) {
            return next(err);
        } else {
            response.redirect("/")
        }
    })
})

app.post('/users', async (request, response) => {
    // Hash Password
    const hashedPwd = await bcrypt.hash(request.body.password, saltRounds)
    console.log(hashedPwd)
    try {
        const user = await User.create({
            firstName: request.body.firstName,
            lastName: request.body.lastName,
            email: request.body.email,
            password: hashedPwd,
        })
        request.login(user, (err) => {
            if (err) {
                console.log(err)
            }
            response.redirect('/todos');
        })

    } catch (err) {
        console.log(err)
    }

})



app.get("/todos/:id", async function (request, response) {
    try {
        const todo = await Todo.findByPk(request.params.id);
        return response.json(todo);
    } catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
});

app.post("/todos", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
    console.log("Creating a todo", request.body);
    console.log(request.user);
    try {
        const todo = await Todo.addTodo({
            title: request.body.title,
            dueDate: request.body.dueDate,
            userId: request.user.id
        });
        return response.redirect("/todos");
    } catch (error) {
        console.log(error);
        request.flash("error", "Date field is empty");
        // return response.status(422).json(error);
    }
    response.redirect('/todos');
});

app.get("/login", (request, response) => {
    response.render("login", {
        title: "Login",
        csrfToken: request.csrfToken(),
    });
})

app.post("/session", passport.authenticate(
    'local', {
    failureRedirect: "/login",
    failureFlash: true,
}),
    (request, response) => {
        console.log(request.user)
        response.redirect("/todos");
    })

app.put("/todos/:id", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
    console.log("We have to update a todo with ID: ", request.params.id)
    const todo = await Todo.findByPk(request.params.id);
    var _staus = request.body.completed
    try {
        const updatedTodo = await todo.setCompletionStatus(todo.completed);
        return response.json(updatedTodo);
    } catch (error) {
        console.log(error);
        return response.status(422).json(error);
    }
});

app.delete("/todos/:id", connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
    console.log("We have to delete a Todo with ID: ", request.params.id);
    try {
        await Todo.remove(request.params.id, request.user.id)
        return response.json({
            success: true,
        })
    } catch (error) {
        return response.status(422).json(error);
    }
});

module.exports = app;
