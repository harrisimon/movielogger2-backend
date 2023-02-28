// Import Dependencies
const express = require("express")
const passport = require("passport")
const User = require("../models/user")
const Log = require("../models/log")
const Comment = require("../models/comment")
const customErrors = require("../../lib/custom_errors")
const removeBlanks = require("../../lib/remove_blank_fields")
const requireOwnership = customErrors.requireOwnership
const handle404 = customErrors.handle404
const { ObjectId } = require("mongodb")
const requireToken = passport.authenticate("bearer", { session: false })

// Create router
const router = express.Router()

router.post("/comments/:id", requireToken, (req, res, next) => {
    req.body.author = req.user.id
	Log.findById(req.params.id)
		.then(handle404)
		.then((log) => {
			log.comments.push(req.body)
			return log.save()
		})
        .then((log) => {
            res.status(201).json({log:log.toObject()})
        })
        .catch(next)
})
router.delete('/comments/:logId/:commId', requireToken, (req, res, next) => {
   
    const {logId, commId} = req.params
    // console.log("log id, commId", logId, commId)
    Log.findById(logId)
        .then((log)=>{
            const comment = log.comments.id(commId)
            // requireOwnership(req, log)
            // console.log('this is the comment that was found', comment)
            comment.remove()
            log.save()
            
            return log
        })
        .then((log) => res.status(204))
        // .then((log)=>console.log(log))
        .catch(next)
})

module.exports = router
