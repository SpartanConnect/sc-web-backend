var express = require('express');
var router = express.Router();
var _ = require('underscore');

var announcements = require('../utilities/announcements');
var authUtilities = require('./../utilities/auth'); //eslint-disable-line spellcheck/spell-checker
var notificationRoutes = require('./notifications');
var eventRoutes = require('./events');
var dbUtility = require('./../utilities/database');
var errorSend = require('../utilities/errors').send;
var enums = require('../utilities/enums'); //eslint-disable-line spellcheck/spell-checker
var tagUtilities = require('../utilities/tags');
var c = require('../utilities/misc');

var errorEnum = enums.errors;
var rankEnum = enums.users;
var statusEnum = enums.status;


function announcementRequestHandler (req, res) {    
    /*eslint-disable indent */
    announcements.getAnnouncements((req.query.id ? req.query.id : req.params.id),
                                    req.query.status,
                                    req.query.startDate,
                                    req.query.endDate,
                                    (req.query.tagId ? req.query.tagId : req.params.tagId),
                                    (req.query.creatorId ? req.query.creatorId : req.params.creatorId),
                                    req.query.adminId).then((data) => {
        //console.log('This should be our data out from the routes page:\n',data);
        /* eslint-enable indent */
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
}

/**
 * 
 * @param {Object} req The request object from the HTTP(S) route.
 * @param {Object} res The response object from the HTTP(S) route. 
 */
function announcementSubmitHandler2 (req, res) {
    c.i('[routes/announcements/announcementSubmitHandler2] Route using announcementSubmitHandler2.', 1);
    if (typeof req.params.id !== 'undefined') {
        //TODO: Add data validation for req.params.id!
        c.i('[routes/announcements/announcementSubmitHandler2] The user has passed a value for the announcement id in the URL.', 2);
        c.i('[routes/announcements/announcementSubmitHandler2] This is what the user entered for the request body: ' + req.body, 3);
        //The user wants to edit an announcement. Fantastic. 😒
        
        //Define varaibles for request catergorazation.
        
        /**
         * A boolean variable which represents whether the user that is attempting the action is an admin or not.
         * @var {Boolean}
         */
        var isAdmin;
        /**
         * A variable which holds the user's rank. It is simply an aliaas of `req.user.rank`. Use this with the `rankEnum` to perform rank checks and comparisons.
         */
        var userRank = req.user.rank;
        /**
         * A boolean variable which represents whether the user is the creator of the specified announcement.
         * It also is `true` if the user is the teacher linked to the announcement.
         * @var {Boolean}
         */
        var isCreator;
        /**
         * A boolean which indicates whether or not title, description, startDate, or endDate data has been submitted. **The new content should be checked to ensure that it has actually been changed.**
         * @var {Boolean}
         */
        var updateContent;
        /**
         * A boolean which indicated if tags have been supplied to update. This value should not be assumed to be an update of the tags. **The tags should be checked to ensure that they have actually changed.**
         * @var {Boolean}
         */
        var updateTags;
        /**
         * A boolean which indicates if the status of the announcement is included in the submitted announcement object. **Similar to `updateContent` and `updateTags`, it should be checked to ensure a change has in fact been made before sending a query.**
         * @var {Boolean}
         */
        var updateStatus;
        /**
         * An integer representing the final rank that an announcement would be after the specified edits.
         * This is used when determining whether someone is approving, denying, removing, or submitting an announcement.
         * @var {Boolean}
         */
        var finalStatus;
        /**
         * A boolean value which determines whether or not the user has a lower or equal rank number (more or the same privileges) than the creator of the announcement. This value is often used in conjunction with the isAdmin variable to determine whether or not an admin can edit another admin's announcement.
         * @var {Boolean}
         */
        var sufficientRank;

        c.i('Checking user rank.', 2);
        // Determine whether or not the user is an admin.
        if (req.user.rank <= rankEnum.RANK_ADMIN) {
            isAdmin = true;
            c.i('[routes/announcements/announcementSubmitHandler2] The user\' rank is ' + req.user.rank + '. Therefore they are an admin.', 3);
        }   
        else {
            isAdmin = false;
            c.i('[routes/announcements/announcementSubmitHandler2] The user\'s rank is ' + req.user.rank + '. Therefore they are NOT an admin.', 3);
        }

        // Determine whether or not the user is requesting to change the content of the announcement.
        // This needs to be checked 
        c.i('[routes/announcements/announcementSubmitHandler2] Checking content submission.', 2);
        if (typeof req.body.title != 'undefined' ||
            typeof req.body.description != 'undefined' || 
            typeof req.body.startDate != 'undefined' ||
            typeof req.body.endDate != 'undefined') {
            updateContent = true;
            c.i('[routes/announcements/announcementSubmitHandler2] The user has submitted either a title, description, startDate, or endDate. Thus updateContent is ' + updateContent + '. The values have not been checked against the values in the database to ensure that they have actually changed.', 3);
        }
        else {
            updateContent = false;
            c.i('[routes/announcements/announcementSubmitHandler2] The user not submitted any content values to update. Therefore updateContent is ' + updateContent + '.', 3);
        }
        // Determine whether or not the user is requesting to change the tags on the announcement.
        // This needs to be checked later to determine whether or not the tag list actually changed.
        // TODO: This also needs to iterate through the tags to ensure that all tags that are attempting to be applied have IDs. DONE 2017/08/03
        c.i('[routes/announcements/announcementSubmitHandler2] Checking tag submission.', 2);
        if (typeof req.body.tags != 'undefined') { //We know that there is a tags object.
            c.i('[routes/announcements/announcementSubmitHandler2] A \'tags\' object has been submitted. The user seems to want to update the tags on the announcement. However, the tags have not been checked against the database to ensure the values have actually changed.', 3);
            c.i('[routes/announcements/announcementSubmitHandler2] Attempting to check the submitted tags.', 2);
            if (Array.isArray(req.body.tags)) {
                c.i('[routes/announcements/announcementSubmitHandler2] The \'tags\' object is an array.', 4);
                if (req.body.tags.length > 0) { //Making sure that the tag objet has objects in it (its length is >0)
                    c.i('[routes/announcements/announcementSubmitHandler2] The \'tags\' array is longer than 0 elements long.', 4);
                    req.body.tags.forEach((tagObject, i) => {
                        c.i('[routes/announcements/announcementSubmitHandler2] Checking tag #' + ( i + 1 ), 4);
                        c.i('[routes/announcements/announcementSubmitHandler2] The currently checked tag object is as follows: ', 4);
                        c.i (tagObject, 4);
                        if (typeof tagObject.id == 'undefined') { // If the if for any tag object is undefined, throw an error.
                            c.w('[routes/announcements/announcementSubmitHandler2] Tag #' + ( i + 1 ) + ' has an undefined (non-existent) id. Throwing TAG_UPDATE_INVALID.', 3);
                            errorSend(errorEnum.TAG_UPDATE_INVALID, res); // Throw TAG_UPDATE_INVALID error. Not sure if this is the rignt one, however.
                            return;
                        }
                        if (isNaN(tagObject.id)) {
                            c.w('[routes/announcements/announcementSubmitHandler2] Tag #' + ( i + 1 ) + 'has an id that isn\'t a number. Throwing TAG_UPDATE_INVALID.', 3);
                            errorSend(errorEnum.TAG_UPDATE_INVALID, res);
                            return;
                        }
                        if (!Number.isInteger(parseFloat(tagObject.id))) { // Use parseFloat instead of parseInt to avoid undesired rounding.
                            c.w('[routes/announcements/announcementSubmitHandler2] Tag #' + ( i + 1 ) + ' has an id that is a number but not an integer. Throwing TAG_UPDATE_INVALID.', 3);
                            errorSend(errorEnum.TAG_UPDATE_INVALID, res);
                            return;
                        }
                        if (!Math.sign(parseFloat(tagObject.id)) == 1) { // Math.sign() might only be necessary. It seems to parseInt and throw NaN. Only thing it doesn't do is see if the value is a integer or not.
                            c.w('[routes/announcements/announcementSubmitHandler2] Tag #' + ( i + 1) + 'has a negative or zero tag id. Throwing TAG_UPDATE_INVALID.', 3);
                            errorSend(errorEnum.TAG_UPDATE_INVALID, res);
                            return;
                        }
                        c.i('[routes/announcements/announcementSubmitHandler2] Tag #' + ( i + 1 ) + ' has a positive integer id.', 4);
                    });
                    updateTags = true;
                    c.i('[routes/announcements/announcementSubmitHandler2] All of the submitted tags objects in the array have valid, integer id.', 3);
                    c.i('[routes/announcements/announcementSubmitHandler2] Therefore, updateTags is true.', 3);
                }
                else {
                    c.w('[routes/announcements/announcementSubmitHandler2] There is a tag array present, but it is empty.', 4);
                    updateTags = false; // The tag object is present but there are no elements in it. //QUESTION: Do I throw an error for this?
                }
            }
            else {
                c.w('[routes/announcements/announcementSubmitHandler2] There is a tag object present, but it isn\'t an array.', 4);

            }
        }
        else { // The tag object isn't present.
            c.i('[routes/announcements/announcementSubmitHandler2] No tag object exists in the user\'s input. Therefore updateTags is false.', 3);
            updateTags = false;
        }
        // Is the status being sent? This needs to be checked later to see if the status is actually changed from the old one.
        c.i('[routes/announcements/announcementSubmitHandler2] Checking status submission.', 2);
        if (typeof req.body.status != 'undefined') {
            updateStatus = true;
            c.i('[routes/announcements/announcementSubmitHandler2] A status has been provided. However, it has not been checked against database. Therefore updateStatus is true for now.', 3);
        }
        else {
            updateStatus = false;
            c.i('[routes/announcements/announcementSubmitHandler2] No status has been defined. Therefore updateStatus is not true.', 3);
        }
        //If no body content, tag data, nor status is being sent, there is nothing to update and we should thrown an error.
        if (updateContent == false && updateTags == false && updateStatus == false) {
            errorSend(errorEnum.ANNOUNCEMENT_UPDATE_EMPTY, res);
            c.w('[routes/announcements/announcementSubmitHandler2] The variables updateContent, updateTags, and updateStatus are all false. Therefore the user has not submitted any values to be updated. Throw an ANNOUNCEMENT_UPDATE_EMPTY error.', 3  );
            return;
        }
        c.i('[routes/announcements/announcementSubmitHandler2] The updates to the announcement have made it past the first stage of redundancy verification. At least one field has been submitted with relevant information.', 3);
        // Now that we know that there is some data to update, we need more info about what is currently in the DB to determine whether or not to actually do anything.
        // Now we query the database to get more information on the creator, content and tags.
        announcements.getAnnouncementById(req.params.id).then((announcementInfo) => {
            c.i('[routes/announcements/announcementSubmitHandler2] Database queried for announcement information.', 2);
            // TODO: We need to ensure that there is announcement info that is returned. If none is returned, we need to throw an error.
            c.i('[routes/announcements/announcementSubmitHandler2] The database has been queried for the announcement that the user wants to edit. This is the raw database output.', 4);
            c.i(announcementInfo, 4);
            c.i('[routes/announcements/announcementSubmitHandler2] The database has been queried for the announcement that the user wants to edit. Its information in the database are as follows.', 3);
            c.i(announcementInfo[0], 3);
            /**
             * A variable (hopefully) containing information about the announcement that is wanted to be edited.
             * This is basically just the first index of the `announcementInfo` variable that is output by the `getAnnouncementById` function.
             * @var {Object}
             * @prop {String} announcementObject.title The title of the announcement frin  the database.
             * @prop {String} announcementObject.description The description of the announcement from the database.
             * @prop {Date} announcementObject.startDate The startDate of the announcement from the databsae.
             * @prop {Date} announcementObject.endDate The end date of the announcement from the database.
             * @prop {number} announcementObject.status The status of the announcement from the database. Should be one of the values fron enums.status
             * @prop {Date} announcementObject.timeSubmitted The date and time that the announcement was first submitted.
             * @prop {Date} announcementObject.timeApproved An optional date and time at which the announcement was approved. If the announcement is not approved, it should be null.
             * @prop {Date} announcementObject.timeEdited The date and time at which the announcement was last edited.
             * @prop {Object} announcementObject.creator The standard user object that contains information about the creator of the announcement.
             * @prop {Object} announcementObject.admin An optional standard user object that contains information about the last admin to affect an announcement. For annnouncements which admins have not taken action upon, this is not present.
             * @prop {Object[]} announcementObject.tags An optional arrray of standard tag objects that contain the tags that an announcement has.
             * @prop {Object[]} announcementObject.events An optional array of standard event objects that contain the event(s) which is/are the child(ren) of the announcement.
             * @readonly 
             */
            var announcementObject = announcementInfo[0];
            //Remeber that getAnnouncementById returns an array of announcement objects.

            /**
             * A variable containing the status of the announcmenet when it was in the database, prior to any modification.
             * @readonly
             */
            var originalStatus = announcementObject.status;

            // Determine whether or not the user is the creator of the announcement.
            c.i('[routes/announcements/announcementSubmitHandler2] Checking the user\'s relationship to the announcement', 2);
            if (announcementObject.creatorId == req.user.id) {
                isCreator = true;
                c.i('[routes/announcements/announcementSubmitHandler2] The user is the creator of the announcement.', 3);
            }
            else {
                isCreator = false;
                c.i('[routes/announcements/announcementSubmitHandler2] The user is not the creator of the announcement.', 3);
            }
            // Determine the final status of the announcement after the submitted changes.
            c.i('[routes/announcements/announcementSubmitHandler2] Determining final status.', 2);
            if (updateStatus) { // If the status has been submitted, then the final status after applying the submitted changes would be read from the request object.
                finalStatus = req.body.status;
                c.i('[routes/announcements/announcementSubmitHandler2] The final status has been set to the status that was submitted since \'updateStatus\' is ' + updateStatus, 3);
            }
            else { //If the status has not been submitted, then it would remain the same as it was at first.
                finalStatus = announcementObject.status;
                c.i('[routes/announcements/announcementSubmitHandler2] The final status has been set to the status that was originally in the database since \'updateStatus\' is ' + updateStatus, 3);
            }
            //We need to compare the creator and editor's ranks to determine if the editopr's rank is sufficient to edit the announcement, in certain cases.
            c.i('[routes/announcements/announcementSubmitHandler2] Submitter rank is being checked against creator rank.', 2);
            if (req.user.rank <= announcementObject.creator.rank) {
                sufficientRank = true;
                c.i('[routes/announcements/announcementSubmitHandler2] Submitter\'s rank is higher or equal to the creator\'s. Therefore, \'sufficientRank\' is ' + sufficientRank, 3);
            }
            else {
                sufficientRank = false;
                c.i('[routes/announcements/announcementSubmitHandler2] The submitter\'s rank is lower than the creator. Therefore, \'sufficientRank\' is ' + sufficientRank, 3);
            }
            //Declare boring variables to use for determining updates to content.
            /**
             * A temporary boolean variable indicating whether or not the title has actually changed. Initialized to false.
             * @var {Boolean} updateTitle
             */
            var updateTitle = false;
            /**
             * A temporary boolean variable indicating whether or not the description has actually changed. Initialized to false.
             * @var {Boolean} updateDescription
             */
            var updateDescription = false;
            /**
             * A temporary boolean variable indicating whether or not the startDate has actually changed. Initialized to false.
             * @var {Boolean} updateStartDate
             */
            var updateStartDate = false;
            /**
             * A temporary boolean variable indicating whether or not the endDate has actually changed. Initialized to false.
             * @var {Boolean} updateEndDate
             */
            var updateEndDate = false;

            //Now that we have the starting values for these parameters, we need to make sure that we only are trying to update the values that have actually changed. 
            //console.log(updateContent);
            if (updateContent) {
                c.i('[routes/announcements/announcementSubmitHandler2] Checking content updates against database.');
                if (typeof req.body.title != 'undefined' && req.body.title != announcementObject.title) {//Is the title of the submitted data is defined, we should compare it to the current value.
                    updateTitle = true;
                    c.i('[routes/announcements/announcementSubmitHandler2] The title has been updated. Therefore updateTitle is true.', 3);
                }
                if (typeof req.body.description != 'undefined' && req.body.description != announcementObject.description) { //Testing for the description actually changing.
                    updateDescription = true;
                    c.i('[routes/announcements/announcementSubmitHandler2] The description has been updated. Therefore updateDescription is true.', 3);
                }
                if (typeof req.body.startDate != 'undefined' && req.body.startDate != announcementObject.startDate)  { // Testing for the start date changing
                    updateStartDate = true;
                    c.i('[routes/announcements/announcementSubmitHandler2] The start date has been updated.', 3);
                }
                if (typeof req.body.endDate != 'undefined' && req.body.endDate != announcementObject.endDate) { // Testing for the end date changing.
                    updateEndDate = true;
                    //Nick left off here. Pick up with console logging later. c.i();
                }
            }

            //console.log('This is what the user submitted as a title: ' + req.body.title);
            //console.log('This is what was in the database: ' + announcementObject.title);

            // Update updateContent to ensure that it actually represents wheteher or not the the values were actually changed.
            updateContent = updateTitle || updateDescription || updateStartDate || updateEndDate;

            //console.log('updateContent is ' + updateContent);

            // Check if the submitted status is actually different from the one that is already in the database.
            if (updateStatus)
                if (req.body.status == announcementObject.status)
                    updateStatus = false;
        
            /**
             * This variable contains the tagId's which the announcement currently has in the database, prior to any changes.
             * @var {Set} currentTags
             * @readonly
             */
            var currentTags = new Set();
            /** 
             * `deleteTags` is a set of tagId's that should be deleted to complete the query.
             * 
             * @var {Set} deleteTags
             */
            var deleteTags = new Set();
            /**
             * `applyTags` is a set of tagId's that should be applied the the announcement for the edit to be completed.
             * 
             * @var {Set} applyTags
             */
            var applyTags = new Set();
            /**
             * `requestTags` is a set of tagId's that the request announcement object contains.
             * 
             * @var {Set} requestTags
             * @readonly
             */
            var requestTags = new Set();

            // If updateTags is true, we need to ensure whether or not the tags have changed. However, this kind of divying up is not necessarily needed here (although its useful for the comparison at the bottom.)
            if (updateTags) {
                //Populate the currentTag set with the tagId's from the db query
                announcementObject.tags.forEach((tagObject) => {
                    currentTags.add(tagObject.id);
                });

                //Populate requestTags set with the request's tag objects.
                req.body.tags.forEach((tagObject) => {
                    requestTags.add(tagObject.id);
                });

                // If one of the tags in the request isn't currently in the announcement, add it to be applied.
                requestTags.forEach((tagId) => {
                    if (!currentTags.has(tagId))
                        applyTags.add(tagId);
                });

                // If one of the tags that is currently applied but isn't in the request, add it to the delete list.
                currentTags.forEach((tagId) => {
                    if (!requestTags.has(tagId))
                        deleteTags.add(tagId);
                });

                //Now we need to make sure that the tags have actually changed. Do this by seeing if the apply and delete tag objects have lengths.
                //console.log(applyTags);
                if (applyTags.size == 0 && deleteTags.size == 0)
                    updateTags = false;
            }


            // Perform a similar check as above to not 'update' the database if nothing has changed.
            //console.log();
            
            if (updateContent == false && updateTags == false && updateStatus == false) {
                errorSend(errorEnum.ANNOUNCEMENT_UPDATE_NO_CHANGES, res);
                return;
            }

            Promise.all([(updateTags? tagUtilities.getTags() : undefined)]).then((allTagsInfo) => {

                /**
                 * A variable that indicates whether or not the user has the necessary permissions to approve the announcements which they have requested. Variable is initalized to true to ensure that in cases where tags are not submitted, the edit will be allowed.
                 */
                var tagApprove = true;

                /**
                 * A variable that indicates whether or not the user has the necessary permissions to add the announcement which they have requested.  Variable is initalized to true to ensure that in cases where tags are not submitted, the edit will be allowed.
                 */
                var tagApply = true;

                //allTagsInfo[0].forEach((tagObject); 
                for (let tagObject in allTagsInfo[0]){
                    if (userRank > tagObject.minUserLevelRequest)
                        tagApprove = false;
                    if (userRank > tagObject.minUserLevelRequest) {
                        tagApply = false;
                        break;
                    }
                }

                //Finally, we should be sure that the user has submitted some new data for the database to update. Now we can have fun with the actual permissions cases! 😒

                //I'm not sure I want to use a switch... I think it might be useful later, but not for the first level of request filtering.

                //FIrst I'm going to go about rejecting cases which shouldn't go through at all.
                if (!sufficientRank) { //If the user is of insufficient rank to edit the announcement.
                    errorSend(errorEnum.ANNOUNCEMENT_UPDATE_FORBIDDEN, res);
                    return;
                }
                else if (!tagApprove && finalStatus == statusEnum.APPROVED_ADMIN) { //If the user is trying to approve the announcement and they cannot approve its tags.
                    errorSend(errorEnum.TAG_APPROVE_FORBIDDEN, res);
                    return;
                }
                else if (!tagApply) { //If they are trying to apply tags that they shoukdn't be able to. 
                    errorSend(errorEnum.TAG_APPLY_FORBIDDEN, res);
                }
                else if(!isAdmin && finalStatus == statusEnum.APPROVED_ADMIN) { //User isn't an admin and they are trying to add the admin approved rank. This also catches if a user other than an admin is trying to edit an announcement while its approved.
                    errorSend(errorEnum.ANNOUNCEMENT_UPDATE_FORBIDDEN, res);
                    return;
                }
                else if (!isAdmin && finalStatus == statusEnum.REJECTED_ADMIN) { // User isn't an admin and they are trying to reject the announcement as an admin,
                    errorSend(errorEnum.ANNOUNCEMENT_UPDATE_FORBIDDEM, res);
                    return;
                }
                else if (!isAdmin && !isCreator) { // User isn't an admin, but they are trying to edit someone else's announcement. Or an announcement created by a student other than their parent.
                    errorSend(errorEnum.ANNOUNCEMENT_UPDATE_FORBIDDEN, res);
                    return;
                }
                else if (userRank <= rankEnum.RANK_TEACHER && finalStatus == statusEnum.REMOVED_STUDENT) {// The user is a teacher or admin but is trying to say that the announcement was removed by a student.
                    errorSend(errorEnum.ANNOUNCEMENT_UPDATE_FORBIDDEN, res);
                    return;
                }
                else if (userRank > rankEnum.RANK_TEACHER && finalStatus == statusEnum.APPROVED_TEACHER) { // A student or lower user is trying to impersonate a teacher.
                    errorSend(errorEnum.ANNOUNCEMENT_UPDATE_FORBIDDEN, res);
                    return;
                }
                else if (userRank > rankEnum.RANK_TEACHER && finalStatus == statusEnum.REJECTED_TEACHER) { // A student or lower user is trying to impersonate a teacher.
                    errorSend(errorEnum.ANNOUNCEMENT_UPDATE_FORBIDDEN, res);
                    return;
                }
                else if (userRank > rankEnum.RANK_TEACHER && finalStatus == statusEnum.REMOVED_TEACHER) { // A student or lower user is trying to impersonate a teacher.
                    errorSend(errorEnum.ANNOUNCEMENT_UPDATE_FORBIDDEN, res);
                    return;
                }
                else if (!isCreator && originalStatus == statusEnum.REMOVED_STUDENT) { // The user is not the creator and is trying to edit an announcement that has been removed by a student.
                    errorSend(errorEnum.ANNOUNCEMENT_UPDATE_FORBIDDEN, res);
                    return;
                }
                else {
                    announcements.announcementUpdateHandler(req.params.id, {title:req.body.title, description:req.body.description, startDate:req.body.startDate, endDate: req.body.endDate, status: req.body.status, adminId: req.user.id}, {applyTags:applyTags, deleteTags:deleteTags}, req.body.reason);
                    // We need to define a next. (Basically implement this as middleware.) 
                    //next(); // eslint-disable-line no-undef 
                }

                /* if (isAdmin && isCreator && finalStatus != statusEnum.APPROVED_ADMIN) { // An admin is editing their own announcement, but not approving it. Approving it requires testing their rank against the tag's ranks.
                    next();
                }
                else if (isAdmin && !isCreator && sufficientRank && ()) // An admin is trying to edit another user's announcement and their rank is higher than the other user's. As always, its not approval. */


                /* switch (permissionsCase) {
                    // Cases for admin editing their own announcement.
                    case caseObjectGenerator(true, true, true, true, true, statusEnum.APPROVED_ADMIN, true): // The user is an admin and editing their own announcement. Let them do what they want. (Errors with tag assignment can be handled later.) In this case they are trying to approve their own announcement. 
                    case caseObjectGenerator(true, true, true, true, true, statusEnum.PENDING_ADMIN, true): // User is an admin and editing own announcement, they are trying to resubmit it for reapproval. Not sure why they would, but OK.
                    case caseObjectGenerator(true, true, true, true, true, statusEnum.REMOVED_TEACHER, true): // User is an admin and editing own announcement. They are trying to remove an announcement from circulation.
                    case caseObjectGenerator(true, true, true, true, true, statusEnum.REJECTED_ADMIN, true): // User is an admin and editing own announcenemt. They are trying to reject their own announcement. Not sure why, but OK.

                    //Cases for admins editing announcements created by users other than their own.
                    case caseObjectGenerator(true, false, true, true, true, statusEnum.PENDING_ADMIN, true): //User is trying to 
                    case caseObjectGenerator(true, false, true, true, true, statusEnum.APPROVED_ADMIN, true):
                    case caseObjectGenerator():

                    default:
                        errorSend(errorEnum.ANNOUNCEMENT_UPDATE_FAILURE);
                        return;
                } */
                
            });
        });
    }
}

function announcementSubmitHandler (req, res) {
    if (typeof req.params.id === 'undefined') {
        //The id that is passed as a URL parameter is undefined (not provided) and thus the request is to create a new announcement
        if (req.user.rank <= 3) {
            //console.log('user has sufficient privileges');
            if (typeof req.body.title !== 'undefined' && 
                typeof req.body.description !== 'undefined' && 
                /* typeof req.body.creatorId !== 'undefined' &&  */
                typeof req.body.startDate !== 'undefined' && 
                typeof req.body.endDate !== 'undefined') {
                //Sufficient information has been provided to create the announcement
                /*eslint-disable indent */
                //console.log(req.body.tags);
                announcements.createAnnouncement(req.body.title,
                                                req.body.description,
                                                req.user.id,
                                                req.body.startDate,
                                                req.body.endDate,
                                                req.body.tags).then((result) => {
                    /*eslint-enable indent */
                    if (result.announcementCreate.affectedRows == 0) {
                        //No rows were affected, thus no announcement was created.
                        res.json({'success':false, 'reason':'No announcement has been created.'});
                        res.end();
                    }
                    else if (result.tagCreate.affectedRows == 0 && typeof req.body.tags !== 'undefined') {
                        //Rows were affected, and so the announcement was created.
                        res.json({'success':false, 'reason':'The tags that you indicated were not applied.'});
                        res.end();
                    }
                    else {
                        res.json({'success':true});
                        res.end();
                    }
                });
            }
            else {
                //Insuffucient data has been submitted in order to create the announcement.
                res.json({'success':false, 'reason':'Insufficient data to create announcement.'});
                res.end();
            }      
        } 
        else {
            res.json({'success':false, 'reason':'You do not have sufficient privileges to create an announcement.'});
            res.end();
        }
    }
    else {
        //The id is defined and thus we want to edit/update an announcement
        if (typeof req.body.title === 'undefined' &&
            typeof req.body.description === 'undefined' &&
            typeof req.body.startDate === 'undefined' &&
            typeof req.body.endDate === 'undefined' &&
            typeof req.body.status === 'undefined' &&
            typeof req.body.tags === 'undefined') {
            //No data has been submitted for changes. Throw error
            res.json({'success':false, 'reason':'The request provides no values to be updated.'});
            res.end();
        }
        else {
            //Some data has beem provided.
            //User wants to edit
            if (isNaN(parseInt(req.params.id))) {
                //An invalid announcement Id has been provided to edit. Reject.
                res.json({'success':false, 'reason':'An invalid announcementId has been provided to edit.'});
                res.end();
            }
            else {
                //Valid announcement ID to edit
                if (req.user.rank <=3) {
                    //console.log('the user\'s rank is sufficient to edit announcements');
                    //The user has a rank sufficient to edit announcements.
                    var announcementInfo = dbUtility.query('SELECT creatorId, status FROM announcements WHERE id = :id', {id:req.params.id});
                    var creatorInfo = dbUtility.query('SELECT rank FROM users WHERE id=(SELECT creatorId FROM announcements WHERE id = :id)', {id: req.params.id});
                    var tagInfo = dbUtility.query('SELECT minUserLevelAssign FROM tags WHERE id IN (SELECT tagId FROM announcements_tags WHERE announcementId = :id)', {id:req.params.id});
                    Promise.all([announcementInfo, creatorInfo,  tagInfo]).then ((announcementCreatorTagInfo) => {
                        let announcementInfo = announcementCreatorTagInfo[0];
                        let creatorInfo = announcementCreatorTagInfo[1];
                        let tagInfo = announcementCreatorTagInfo[2];
                        //console.log(tagInfo);
                        var minTagLevel = 3;
                        
                        tagInfo.forEach((tag) => {
                            if (tag.minUserLevelAssign<minTagLevel) {
                                minTagLevel = tag.minUserLevelAssign;
                            }
                        });

                        let endStatus = req.body.status ? req.body.status : announcementInfo[0].status;
                        if (req.body.status == 1 && req.user.rank >= minTagLevel) {
                            res.json({success:false, reason: 'You do not have sufficient permissions to approve the indicated announcement\'s tags.'});
                            res.end();
                        }
                        else if ((req.user.id == announcementInfo[0].creatorId && (endStatus == 0 || endStatus == 3 || announcementInfo[0].status == 2) && req.body.status != 2) || //User is creator and wants to edit own announcement and wants to set to pending or remove it
                            (req.user.rank <= 2 && req.user.rank <= creatorInfo[0].rank)) { //User is an admin and is trying to edit or approve an announcement created by someone of equal or lower rank.
                            if (typeof req.body.tags !== 'undefined') {
                                //Tags should be updated
                                announcements.updateTags(req.params.id, req.body.tags).then((updateTagResults) => {
                                    let announcementUpdateResult = {};
                                    announcementUpdateResult.tagDeleteResult = updateTagResults.deleteResult;
                                    announcementUpdateResult.tagCreateResult = updateTagResults.createResult;
                                    if (announcementUpdateResult.tagDeleteResult.affectedRows == 0) {
                                        //The tags haven't been deleted. Throw error
                                        res.json({'success':false,'reason':'The tags that were assigned to the announcement were not deleted.'});
                                        res.end();
                                    }
                                    else if (announcementUpdateResult.tagCreateResult.affectedRows == 0) {
                                        //The tags have not be re-created Throw error
                                        res.json({'success':false, 'reason':'The tags that you indicated were not applied.'});
                                        res.end();
                                    }
                                    else if (typeof req.body.title === 'undefined' &&
                                            typeof req.body.description === 'undefined' &&
                                            typeof req.body.startDate === 'undefined' &&
                                            typeof req.body.endDate === 'undefined' &&
                                            typeof req.body.adminId === 'undefined' &&
                                            typeof req.body.status === 'undefined') {
                                        //The user only wants to update the tags. If this is successful, then throw success
                                        res.json({'success':true});
                                        res.end();
                                    }
                                });
                            }
                            if (!(typeof req.body.title === 'undefined' &&
                                typeof req.body.description === 'undefined' &&
                                typeof req.body.startDate === 'undefined' &&
                                typeof req.body.endDate === 'undefined' &&
                                typeof req.body.adminId === 'undefined' &&
                                typeof req.body.status === 'undefined')) {
                                //user wants to update an announcement
                                /* eslint-disable indent */
                                Promise.all(announcements.updateAnnouncement(req.params.id,
                                                               req.body.title,
                                                               req.body.description,
                                                               req.body.startDate,
                                                               req.body.endDate,
                                                               req.body.adminId,
                                                               req.body.status,
                                                               req.body.reason)).then((updateResult) => {
                                    if (updateResult[0].affectedRows == 1) {
                                        res.json({'success':true});
                                        res.end();
                                    }
                                    else {
                                        res.json({'success':false, 'reason':'The changes that were submitted affected no announcements.'});
                                        res.end();
                                    }
                                });
                            }
                        }
                        else {
                            res.json({success:false, reason:'You do not have sufficient privileges to edit this announcement. This may be due to you trying to edit your own, already approved, announcement without also removing it or requesting approval again.'});
                            res.end();
                        }
                    }).catch ((error) => {
                        console.log(error);
                    });
                }
                else {
                    //console.log('The user does not have sufficient privileges');
                    res.json({success:false, reason:'You do not have sufficient privileges to edit announcements.'});
                    res.end();
                }
            }
        }
    }
}

router.get('/announcements/', announcementRequestHandler);

router.post('/announcements/', authUtilities.verifyAuthenticated(), announcementSubmitHandler);

router.get('/announcements/current', function (req, res) {
    let todayDate = new Date();
    todayDate.setHours(0,0,0,0);
    req.query.startDate =todayDate;
    req.query.endDate = todayDate;
    req.query.status = 1;
    announcementRequestHandler(req, res);
});

router.get('/announcements/:announcementId/notifications', notificationRoutes.notificationRequestHandler);

router.get('/announcements/:announcementId/events', (req, res) => {
    eventRoutes.eventRequestHandler (req, res);
});

router.get('/announcements/:announcementId/deadlines', (req, res) => {
    req.query.type = 1;
    eventRoutes.eventRequestHandler (req, res);
});

router.post('/announcements/:id', authUtilities.verifyAuthenticated(), announcementSubmitHandler);

router.get('/announcements/:id', announcementRequestHandler);

module.exports = router;
module.exports.announcementRequestHandler = announcementRequestHandler;
