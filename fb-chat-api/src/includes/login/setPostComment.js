/**
 * @fix by NTKhang
 * update as Thursday, 10 February 2022
 * do not remove the author name to get more updates
 */

"use strict";

const utils = require("../utils");
const log = require("npmlog");

module.exports = function (defaultFuncs, api, ctx) {
    return function setPostComment(postID, message, callback) {
        let resolveFunc = function () { };
        let rejectFunc = function () { };
        const returnPromise = new Promise(function (resolve, reject) {
            resolveFunc = resolve;
            rejectFunc = reject;
        });

        if (!callback) {
            if (utils.getType(message) === "Function" || utils.getType(message) === "AsyncFunction") {
                callback = message;
                message = "";
            }
            else {
                callback = function (err, data) {
                    if (err) {
                        return rejectFunc(err);
                    }
                    resolveFunc(data);
                };
            }
        }

        const form = {
            av: ctx.i_userID || ctx.userID,
            fb_api_caller_class: "RelayModern",
            fb_api_req_friendly_name: "CometUFIAddCommentMutation",
            doc_id: "4769042373179384",
            variables: JSON.stringify({
                input: {
                    actor_id: ctx.i_userID || ctx.userID,
                    feedback_id: (new Buffer("feedback:" + postID)).toString("base64"),
                    comment_text: message,
                    comment_source: "OBJECT",
                    is_tracking_encrypted: true,
                    tracking: [],
                    session_id: "f7dd50dd-db6e-4598-8cd9-561d5002b423",
                    client_mutation_id: Math.round(Math.random() * 19).toString()
                },
                useDefaultActor: false,
                scale: 3
            })
        };

        defaultFuncs
            .post("https://www.facebook.com/api/graphql/", ctx.jar, form)
            .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
            .then(function (resData) {
                if (resData.errors) {
                    throw resData;
                }
                return callback(null, resData);
            })
            .catch(function (err) {
                log.error("setPostComment", err);
                return callback(err);
            });

        return returnPromise;
    };
};
