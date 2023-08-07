const {Router} = require('express');
const controller = require('./controllers')

const router = Router();

router
.route("/schedulemail")
.get(controller.getAllScheduledEmails)
.post(controller.createEmail)
.delete(controller.deleteScheduledMail)

router
.route("/:id")
.put(controller.updateScheduledMail)
.get(controller.getScheduledMailById)

router
.route("/unsentEmail")
.post(controller.unsentEmails)
    

module.exports = router;