var Firebase = require("firebase"),
    config = require('./config'),
    constants = require('./constants')

var app_root = new Firebase(config.db.url).child("s3_points");

var mailRef = app_root.child("mail");

var penaltyWordsRef = app_root.child("penaltyWords");
var penalty_words = [];
penaltyWordsRef.on("value", function(ss) {
    penalty_words = ss.val() || [];
});

var fields_to_log = ["from", "to", "cc", "subject", "messageId"];
exports.log_mail = function(mail) {
    mailRef.once("value", function(ss) {
        var data = ss.val() || [];
        var currentId = data.length;
        var record = {};
        fields_to_log.forEach(function(field) {
            if (mail[field])
                record[field] = mail[field];
        });
        record.penalty = penalty_words.filter(function(word) {
            return ((mail.text || "") + (mail.subject || "")).toLowerCase().indexOf(word) > -1;
        }).length;
        record.timestamp = new Date(mail.date).getTime();
        var i = data.findIndex(function(mail) {
            return mail.messageId === record.messageId;
        });
        if (i == -1) mailRef.child(currentId).set(record);
    });
}

exports.mailRef = mailRef;