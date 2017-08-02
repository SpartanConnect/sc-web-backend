var database = require('./database');
var users = require('./users');
var events = require('./events');

// Getter
exports.getAnnouncements = function(id, status, startDate, endDate, tagId, creatorId, adminId) {
    var statement = 'SELECT id FROM announcements';
    var statementParameters = {};

    if(typeof id != 'undefined') { statementParameters.id = id; }
    if(typeof status != 'undefined') { statementParameters.status = status; }
    if(typeof creatorId != 'undefined') { statementParameters.creatorId = creatorId; }
    if(typeof adminId != 'undefined') { statementParameters.adminId = adminId; }

    if(Object.keys(statementParameters).length != 0) {
        statement += ' WHERE ';
        Object.keys(statementParameters).forEach(function(item, index) {
            if(index != 0) { statement += ' AND '; }
            statement += item + ' = :' + item;
        });
    }

    if (typeof tagId !== 'undefined') {
        //console.log('tagId is not undefined!');
        //console.log('this is tagId!', tagId);
        if (Object.keys(statementParameters).length !== 0) {statement += ' AND ';}
        else {statement += ' WHERE ';}
        if (tagId == 0) {statement += ' id IN (SELECT announcementId FROM announcements_tags WHERE tagId IN ( SELECT id FROM tags WHERE parentId IS NULL )) ';}
        else {statement += ' id IN (SELECT announcementId FROM announcements_tags WHERE tagId=:tagId) ';}
        statementParameters.tagId = tagId;
    }

    if(typeof startDate != 'undefined' && typeof endDate != 'undefined') {
        if (Object.keys(statementParameters).length === 0) statement += ' WHERE ';
        else statement += ' AND ';
        statement += 'NOT ( (startDate > :endDate) OR (endDate < :startDate) )';
        statementParameters.startDate = startDate;
        statementParameters.endDate = endDate;
    }

    //console.log(statement);

    return new Promise ((resolve) => {
        database.query(statement + ';', statementParameters).then((idList) => {
            if (idList.length === 0) {return resolve ();}

            var announcementResults = [];
            var announcementPromises = idList.map((announcementId) => {
                return exports.getAnnouncementById(announcementId.id).then((data) => {
                    //console.log('This is the data from the getAnnouncementById, which should be blank',data);
                    announcementResults.push(data[0]);
                    // We had no other choice..
                    if (announcementResults.length === announcementPromises.length) {
                        resolve(announcementResults);
                    }
                });
            });
        });
    });
};

exports.getAnnouncementById = function(id) {
    //console.log('Hit getAnnouncementById');
    let announcementSqlQuery = database.query('SELECT * FROM announcements WHERE id=:id;',{id:id});
    let tagSqlQuery = database.query('SELECT * FROM tags WHERE id IN (SELECT tagId FROM announcements_tags WHERE announcementId=:id);',{id:id});
    //let creatorSqlQuery = database.query('SELECT * FROM users WHERE id = (SELECT creatorId FROM announcements WHERE id=:id)',{id:id});
    //let adminSqlQuery = database.query('SELECT * FROM users WHERE id = (SELECT adminId FROM announcements WHERE id=:id)',{id:id});
    //console.log("sent all queries");
    return new Promise ((resolve) => {
        //console.log('Returning new promise');
        Promise.all([announcementSqlQuery, tagSqlQuery]).then((announcementResultArray) => {
            if (typeof announcementResultArray[0][0] === 'undefined') {return resolve();}
            let rawAnnouncementArray = announcementResultArray[0];
            let creatorDatabaseQuery = users.getUserById(rawAnnouncementArray[0].creatorId, false);
            let adminDatabaseQuery = users.getUserById(rawAnnouncementArray[0].adminId, false);
            let eventDatabaseQuery = events.getEvents(undefined, undefined, id, undefined, undefined);
            Promise.all([creatorDatabaseQuery,adminDatabaseQuery, eventDatabaseQuery]).then((userEventResultArray) => {
                //console.log('This is the promise result array:\n',promiseResultArray);
                //console.log('This is the rawAnnouncementArray\n', rawAnnouncementArray);
                //console.log(userEventResultArray);
                let rawCreatorArray = [userEventResultArray[0]];
                //console.log('This is the rawCreatorArray\n', rawAnnouncementArray);
                let rawAdminArray = [userEventResultArray[1]];
                //console.log('This is the rawAdmin info\n', rawAdmin);
                let rawEventArray = [userEventResultArray[2]];
                //console.log('this is the raw event array', rawEventArray);
                let rawTags = [announcementResultArray[1]];
                //console.log('This is (hopefully the raw array of tags)\n',rawTags);
                //console.log('promise results divvied up');
                resolve (exports.announcementPacker(rawAnnouncementArray, rawCreatorArray, rawAdminArray, rawTags, rawEventArray));
            }).catch(error =>{
                console.log(error);
            });
        }).catch(error =>{
            console.log(error);
        });
    });
};

// Setters
exports.createAnnouncement = (title, description, creatorId, startDate, endDate, tags) => {
    //console.log('create Announcement hit');
    /*eslint-disable indent */
    return new Promise ((resolve) => {
        let statementParameters = {title:title,
                                   description:description,
                                   creatorId:creatorId,
                                   startDate:startDate,
                                   endDate:endDate};
        /* eslint-enable indent */
        database.query('INSERT INTO announcements (title, description, creatorId, startDate, endDate, status) VALUES (:title, :description, :creatorId, :startDate, :endDate, 0)', statementParameters).then((announcementCreateResult) => {
            if (typeof tags !== 'undefined') {
                //console.log('tags should be declared');
                exports.createTags(announcementCreateResult.insertId, tags).then((tagCreationResult) => {
                    resolve({'announcementCreate':announcementCreateResult, 'tagCreate':tagCreationResult});
                });
            }
            else {
                resolve ({'announcementCreate':announcementCreateResult});
            }
        }).catch((err) => {
            console.log(err);
        });
    });
};

exports.createTags = (id, tags) => {
    console.log('tag creation hit');
    let tagCreateQueryStatement = 'INSERT INTO announcements_tags (announcementId, tagId) VALUES ';
    let tagCreateQueryStatementParameters = {};
    console.log(id);
    console.log(tags);
    tags.forEach((tagObject, index) => {
        if (index !== 0) {
            tagCreateQueryStatement += ' , ';
        }
        tagCreateQueryStatement += ('( :id, '+':tagId'+index+' )');
        tagCreateQueryStatementParameters['tagId'+index] = tagObject.id;
    });
    console.log(tagCreateQueryStatement);
    console.log(tagCreateQueryStatementParameters);

    tagCreateQueryStatementParameters.id =id;

    return database.query(tagCreateQueryStatement+'ON DUPLICATE KEY UPDATE tagId=tagId ;', tagCreateQueryStatementParameters);
};

/**
 * A function that takes in an array of tagId's and deletes them from the announcement indicated by the `announcementId` parameter.
 * @param {number} announcementId The number of announcement from which to delete the tags.
 * @param {number[]} tagIdArray An array of tagIds which indicate which tags to delete.
 * 
 * @returns {Promise} A result object from the SQL server. Use this to determine the success of the statement.
 */
exports.deleteTags = (announcementId, tagIdArray) => {
    /**
     * The SQL statement that is sent to the server. Upon initialization, it's only the start of the query, it needs to be filled in.
     * @var {string} statement
     */
    let statement = 'DELETE FROM announcements_tags WHERE (announcementId, tagId) IN (';
    
    /**
     * Theses are the values that should be substituted into the query when its sent to DB.
     * @var {Object} parameters
     */
    let parameters = {announcementId: announcementId};

    //Loop through the tagId's from the input and add the necessary announcement- and tag-Id pairs to the db. Solution found here: https://stackoverflow.com/a/14904327
    tagIdArray.forEach((tagId, i) => {
        if (i != 0) // Ensure commas are added only before the pairs after the first. Desired output (x,y) , (x,y) , (x,y)
            statement += ' , ';
        statement += '( :announcementId , :tagId' + i + ' )';
        parameters['tagId' + i] = tagId;
    });
    // Remember to properly close the SQL statement, otherwise, it will error.
    statement += ');';
    if (tagIdArray.length != 0) //Make sure we aren't passing an incomplete SQL statement.
        return database.query(statement, parameters);
    return;
};

exports.updateTags = (id, tags) => {
    return new Promise ((resolve) => {
        database.query('DELETE FROM announcements_tags WHERE announcementId = :announcementId', {'announcementId':id}).then((deleteResult) => {
            if (tags.length != 0) {
                let tagCreateQueryStatement = 'INSERT INTO announcements_tags (announcementId, tagId) VALUES ';
                let tagCreateQueryStatementParameters = {};
                
                tags.forEach((tagObject, index) => {
                    if (index !== 0) {
                        tagCreateQueryStatement += ' , ';
                    }
                    tagCreateQueryStatement += '(:id, '+':tagId'+index+')';
                    tagCreateQueryStatementParameters['tagId'+index] = tagObject.id;
                });
                tagCreateQueryStatementParameters.id = id;
                database.query(tagCreateQueryStatement, tagCreateQueryStatementParameters).then((createResult) => {
                    resolve ({'deleteResult':deleteResult, 'createResult':createResult});
                });
            }
        });
    });
};

exports.announcementUpdateHandler = (announcementModifications, tagModifications) => {

};

exports.updateAnnouncement = (id, title, description, startDate, endDate, adminId, status) => {
    let statement = 'UPDATE announcements SET ';
    let statementParameters = {};

    if(typeof title != 'undefined') { statementParameters.title = title; }
    if(typeof description != 'undefined') { statementParameters.description = description; }
    if(typeof startDate != 'undefined') { statementParameters.startDate = startDate; }
    if(typeof endDate != 'undefined') { statementParameters.endDate = endDate; }
    if(typeof adminId != 'undefined') { statementParameters.adminId = adminId; }
    if(typeof status != 'undefined') { statementParameters.status = status; }
    if(typeof status != 'undefined' && status == 1) {statementParameters.timeApproved = new Date();}

    if(Object.keys(statementParameters).length != 0) {
        Object.keys(statementParameters).forEach(function(item, index) {
            if(index != 0) { statement += ' , '; }
            statement += item + ' = :' + item;
        });
    }

    statementParameters.id = id;

    return database.query(statement+' WHERE id = :id;',statementParameters);
};

// Utilities
exports.sanitizeInput = function() {
};

exports.desanitizeInput = function() {
};

exports.announcementPacker = function(rawAnnouncementArray, rawUserCreatorArray, rawUserAdminArray, rawTagArrayArray, rawEventArrayArray) {
    //console.log('hit packager');
    //console.log(rawTagArrayArray);
    //console.log('This is the rawAnnouncementArray from the announcementPackager',rawAnnouncementArray);
    let announcementObject = rawAnnouncementArray.map((rawAnnouncement, announcementIndex) => {
        if (typeof rawAnnouncement.creatorId !== 'undefined') {
            rawAnnouncement.creator = rawUserCreatorArray[announcementIndex];
            delete rawAnnouncement.creatorId;
        }
        if (typeof rawAnnouncement.adminId !== 'undefined') {
            rawAnnouncement.admin = rawUserAdminArray[announcementIndex];
            delete rawAnnouncement.adminId;
        }
        rawAnnouncement.tags = rawTagArrayArray[announcementIndex];
        rawAnnouncement.events = rawEventArrayArray[announcementIndex];
        return rawAnnouncement;
    });
    ////console.log(announcementObject);
    return announcementObject;
};

module.exports = exports;
