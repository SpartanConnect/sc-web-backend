var express = require('express');
var router = express.Router();

var userUtilities = require('../utilities/users');

function userRequestHandler (req, res) {
    userUtilities.getUsers(req.query.id, req.query.rank, req.query.handle).then((userObjectResults) => {
        if(typeof userObjectResults==='undefined') {
            res.json();
        }
        else if (userObjectResults.length === 1) {
            res.json(userObjectResults[0]);
        }
        else {
            res.json(userObjectResults);
        }
        res.end();
    }).catch(error => {
        console.log(error);
    });
}

router.get('/users/', userRequestHandler);

module.exports = router;
