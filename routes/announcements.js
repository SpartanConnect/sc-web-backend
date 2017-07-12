var express = require('express');
var router = express.Router();

var announcements = require('../utilities/announcements');
var notificationRoutes = require('./notifications');
var eventRoutes = require('./events');

function announcementRequestHandler (req, res) {
    announcements.getAnnouncements((req.query.id ? req.query.id : req.params.id),
                                    req.query.status,
                                    req.query.startDate,
                                    req.query.endDate,
                                    (req.query.tagId ? req.query.tagId : req.params.tagId),
                                    (req.query.creatorId ? req.query.creatorId : req.params.creatorId),
                                    req.query.adminId).then((data) => {
        //console.log('This should be our data out from the routes page:\n',data);
        if (typeof data==='undefined') {
            res.json([]);
        }
        else
        {
            res.json(data);
        }
        res.end();
    }).catch(error => {
    console.log(error);
    });
};


router.get('/announcements/', announcementRequestHandler);

router.get('/announcements/current', function (req, res) {
    //console.log(new Date());
    req.query.startDate = new Date();
    req.query.endDate = new Date();
    announcementRequestHandler(req, res);
})

router.get('/announcements/:announcementId/notifications', notificationRoutes.notificationRequestHandler)

router.get('/announcements/:announcementId/events', (req, res) => {
    eventRoutes.eventRequestHandler (req, res);
});

router.get('/announcements/:announcementId/deadlines', (req, res) => {
    req.query.type = 1;
    eventRoutes.eventRequestHandler (req, res);
});

router.get('/announcements/:id', announcementRequestHandler);

module.exports = router;
module.exports.announcementRequestHandler = announcementRequestHandler;
