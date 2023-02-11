// Import Dependencies
const express = require("express")
const passport = require("passport")
const User = require("../models/user")
const Log = require("../models/log")
const customErrors = require("../../lib/custom_errors")
const removeBlanks = require('../../lib/remove_blank_fields')
const handle404 = customErrors.handle404
const { ObjectId } = require("mongodb")
const requireToken = passport.authenticate("bearer", { session: false })

// Create router
const router = express.Router()

// Router Middleware
// Authorization middleware
// If you have some resources that should be accessible to everyone regardless of loggedIn status, this middleware can be moved, commented out, or deleted.
///////////////////////////////////
/// decide on whether to use this
////////////////////////////////
// router.use((req, res, next) => {
// 	// checking the loggedIn boolean of our session
// 	if (req.session.loggedIn) {
// 		// if they're logged in, go to the next thing(thats the controller)
// 		next()
// 	} else {
// 		// if they're not logged in, send them to the login page
// 		res.redirect('/auth/login')
// 	}
// })

// Routes

// index ALL
router.get("/reviews", (req, res, next) => {
	Log.find()
		.populate("author", "username")
		.then((log) => {
            
			// const username = req.session.username
			// const loggedIn = req.session.loggedIn
            return log.map((log) => log.toObject())
			
		})
        .then((log) => {
            res.status(200).json({log:log})
        })
		.catch(next)
})

// index that shows only the user's logs
router.get("/mine", (req, res) => {
	// destructure user info from req.session
	const { username, userId, loggedIn } = req.session

	Log.find({ author: userId })
		.populate("author", "username")
		.then((logs) => {
			// res.render("logs/index", { logs, username, loggedIn })
            res.sendStatus(201).json({log:log.toObject()})
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})


router.post("/reviews", requireToken, removeBlanks, (req, res, next) => {
    req.body.review.author = req.user._id
    console.log("user",req.user)
	Log.create(req.body.review)
		.then(handle404)
		.then((log) => {
			res.status(201).json({ log: log.toObject() })
		})
		.catch(next)
	// how to deal with API key??

	// axios(`http://www.omdbapi.com/?apikey=${process.env.API_KEY}4&t=${searchTitle}&plot=full`)
	// .then(result => {

	// 		const movieTitle = result.data.Title
	// 		const movieYear = result.data.Year
	// 		const movieRuntime = result.data.Runtime
	// 		const movieDirector = result.data.Director
	// 		const moviePlot = result.data.Plot
	// 		const movieGenre = result.data.Genre
	// 		const movieImdbId = result.data.imdbID
	// 		const moviePoster = result.data.Poster
	// 		console.log(result.data.response)
	// 		const movie = {
	// 			title: movieTitle,
	// 			year: movieYear,
	// 			runtime: movieRuntime,
	// 			director: movieDirector,
	// 			plot: moviePlot,
	// 			genre: movieGenre,
	// 			imdbId: movieImdbId,
	// 			poster: moviePoster,

	// 		}
	// res.render('logs/new', {movie: movie, username, loggedIn})

	// })
})

// create -> POST route that actually calls the db and makes a new document
// post the log with the comment
// router.post('/', (req, res) => {

// 	req.body.author = req.session.userId

// 	console.log("here",req.body)
// 	Log.create(req.body)
// 		.then(log => {
// 			res.redirect('/logs')
// 		})
// 		.catch(error => {
// 			res.redirect(`/error?error=${error}`)
// 		})
// })

// edit route -> GET that takes us to the edit form view
router.get("/:id/edit", (req, res) => {
	const username = req.session.username
	const loggedIn = req.session.loggedIn
	const userId = req.session.userId
	const logId = req.params.id

	Log.findById(logId)
		.then((log) => {
			res.render("logs/edit", { log, username, loggedIn, userId })
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// update route
router.put("/:id", (req, res) => {
	const logId = req.params.id
	const logText = req.body.logText
	req.body.author = req.session.userId

	Log.findById(logId, req.body)
		.then((log) => {
			return log.updateOne(req.body)
		})
		.then(() => {
			res.redirect(`/logs/${logId}`)
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// show route
router.get("/:id", (req, res) => {
	const logId = req.params.id

	Log.findById(logId)
		.populate("comments.author", "username")
		.populate("author", "username")
		.then((log) => {
			const { username, loggedIn, userId } = req.session
			console.log(log)
			res.render("logs/show", { log, username, loggedIn, userId })
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// delete route
router.delete("/:id", (req, res) => {
	const logId = req.params.id
	Log.findByIdAndRemove(logId)
		.then((log) => {
			res.redirect("/logs/mine")
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// Export the Router
module.exports = router
