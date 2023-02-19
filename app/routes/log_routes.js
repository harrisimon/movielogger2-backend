// Import Dependencies
const express = require("express")
const passport = require("passport")
const User = require("../models/user")
const Log = require("../models/log")
const customErrors = require("../../lib/custom_errors")
const removeBlanks = require("../../lib/remove_blank_fields")
const requireOwnership = customErrors.requireOwnership
const handle404 = customErrors.handle404
const { ObjectId } = require("mongodb")
const requireToken = passport.authenticate("bearer", { session: false })

// Create router
const router = express.Router()

// Routes

// index ALL
router.get("/reviews", (req, res, next) => {
	Log.find()
		.populate("author", "email")
		.then((log) => {
			return log.map((log) => log.toObject())
		})
		.then((log) => {
			res.status(200).json({ logs: log })
		})
		.catch(next)
})

// index that shows only the user's logs
router.get("/mine", requireToken, (req, res, next) => {
	const author = req.user._id
	Log.find({ author: ObjectId(`${author}`) })
		.populate("author", "email")
		.then(handle404)
		.then((log) => {
			return log.map((log) => log.toObject())
		})
		.then((logs) => {
			res.status(200).json({ logs: logs })
		})
		.catch(next)
})

router.post("/reviews", requireToken, removeBlanks, (req, res, next) => {
	req.body.review.author = req.user._id
	// console.log("user", req.user)
	Log.create(req.body.review)
		.then(handle404)
		.then((log) => {
			res.status(201).json({ log: log.toObject() })
		})
		.catch(next)
})

// update route
router.put("/reviews/:id", requireToken, (req, res, next) => {
	const logId = req.params.id
	// console.log(req.user.id)
	Log.findById(logId)
		.then((log) => {
            requireOwnership(req, log)
			return log.updateOne(req.body)
		})
		.then((log) => {
			res.status(204).json({ log: {log }})
		})
		.catch(next)
})

// show route
router.get("/reviews/:id", (req, res, next) => {
	const logId = req.params.id

	Log.findById(logId)
		.populate("comments.author", "email")
		.populate("author", "email")
		.then((log) => {
			return log.toObject()
		})
		.then((log) => {
			res.status(200).json({ log: log })
		})
		.catch(next)
})

// delete route
router.delete("/reviews/:id", requireToken, (req, res, next) => {
	const logId = req.params.id
	Log.findById(logId)
        .then(handle404)
        .then((log) => {
            requireOwnership(req, log)
            log.deleteOne()
        })
		.then(()=> res.sendStatus(204))
		.catch(next)
})

// Export the Router
module.exports = router
