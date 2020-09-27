/**
 * modules dependencies.
 */
const socketio = require('socket.io');
const mongoose = require('mongoose');
const shortid = require('shortid');
const logger = require('./loggerLib.js');
const events = require('events');
const eventEmitter = new events.EventEmitter();
const userController = require("./../controllers/userController");
let eventAlerts = {};

const tokenLib = require("./tokenLib.js");
const check = require("./checkLib.js");
const response = require('./responseLib')

const Friend = mongoose.model('Friend')

let setServer = (server) => {

    let allOnlineUsers = []

    let io = socketio.listen(server);

    //let myIo = io.of('')

    console.log('connection Starts');

    io.on('connection',(socket) => {

        console.log("on connection--emitting verify user");

        // code to verify the user and make him online

        socket.on('set-user',(authToken) => {

           // console.log("set-user called", authToken)
            tokenLib.verifyClaimWithoutSecret(authToken,(err,user)=>{
                if(err){
                    socket.emit('auth-error', { status: 500, error: 'Please provide correct auth token' })
                }
                else{

                    //console.log("user is verified..setting details", user);
                    let currentUser = user.data;
                    // setting socket user id 
                    socket.userId = currentUser.userId
                    let fullName = `${currentUser.firstName} ${currentUser.lastName}`
                    console.log(`${fullName} is online`);
                    socket.emit(currentUser.userId,"You are online")

                    let userObj = {userId:currentUser.userId,fullName:fullName}
                     var found = allOnlineUsers.some(function (el) {
                        return el.userId === userObj.userId;
                    });
                    if (!found) { allOnlineUsers.push(userObj); }

                    console.log('AllOnlineusers', allOnlineUsers);

                     // setting room name
                     socket.room = 'edChat'
                     // joining chat-group room.
                     socket.join(socket.room)
                     socket.to(socket.room).broadcast.emit('online-user-list',allOnlineUsers);

                }


            })
          
        }) // end of listening set-user event


        socket.on('disconnect', (userId) => {
            // disconnect the user from socket
            // remove the user from online list
            // unsubscribe the user from his own channel

            console.log("user is disconnected");
            // console.log(socket.connectorName);
            console.log(userId);
            var removeIndex = allOnlineUsers.map(function(user) { return user.userId; }).indexOf(userId);
            allOnlineUsers.splice(removeIndex,1)
            console.log('After Logout', allOnlineUsers)


        }) // end of on disconnect


        eventAlerts.addfriend = (data) => {
            io.emit(data.requestedToId, data)
            io.emit(data.requestedById, data)
        }

        eventAlerts.acceptFriendship = (data) => {

            io.emit(data.requestedToId, data)
           io.emit(data.requestedById, data)
        }

        eventAlerts.newToDo = (data) => {
            console.log('ADDEDTODO', data);
            console.log('userId', data.userId);
            setTimeout(() => {
                    Friend.find({$or: [{'requestedById': data.userId}, {'requestedToId': data.userId}]}).select(' -__v -_id').lean().exec((err, result) => {
                        if(err) {
                            let apiResponse = response.generate(true, 'Failed to find users', 500, null)
                            //res.send(apiResponse)
                        } else if (check.isEmpty(result)) {
                            let apiResponse = response.generate(true, 'No User Found', 404, null)
                            //res.send(apiResponse)
                        } else {
                            console.log('LIST OF FRIENDS', result);
                            //let apiResponse = response.generate(false, 'All user Details Found', 200, result)
                            //res.send(result)
                            for(let item of result) {
                                let userDetails = {
                                    'message':'',
                                    'todo': true,
                                    'data': data,
                                    'created': true 
                                }
                                if(item.requestedById === data.userId && item.status === 'ACCEPTED') {
                                    //userDetails.message = `${data.toDoName} todo is created by ${item.requestedByName}`
                                    userDetails.todo = true;
                                    let arrayDetails = userDetails.data.history;
                                       var val = arrayDetails[arrayDetails.length - 1]; // 6
                                       userDetails.message = val;
                                    io.emit(item.requestedToId, userDetails)
                                    console.log(`${data.toDoName} todo is created by ${item.requestedByName}`)
                                } else if(item.requestedToId === data.userId && item.status === 'ACCEPTED'){
                                    //userDetails.message= `${data.toDoName} is created by ${item.requestedToName}`
                                    userDetails.todo = true; 
                                    let arrayDetails = userDetails.data.history;
                                       var val = arrayDetails[arrayDetails.length - 1]; // 6
                                       userDetails.message = val;                                   
                                    io.emit(item.requestedById, userDetails)
                                    console.log(`${data.toDoName} is created by ${item.requestedToName}`)
                                }
                            }
                            let userDetails = {
                                'message':'',
                                'todo': true,
                                'data': data,
                                'created': true 

                            }
                            let arrayDetails = userDetails.data.history;
                            var val = arrayDetails[arrayDetails.length - 1]; // 6
                            userDetails.message = val;
                            io.emit(data.userId, userDetails);
                        }
                    })
               // })
            }, 2000);
        }


        eventAlerts.updateToDo = (data) => {
            console.log('updateToDo', data);
            setTimeout(() => {
                //var promise = new Promise((resolve, reject) => {
                   // eventEmitter.emit('send-todo', data.userId)
                    Friend.find({$or: [{'requestedById': data.userId}, {'requestedToId': data.userId}]}).select(' -__v -_id').lean().exec((err, result) => {
                        if(err) {
                            let apiResponse = response.generate(true, 'Failed to find users', 500, null)
                            //res.send(apiResponse)
                        } else if (check.isEmpty(result)) {
                            let apiResponse = response.generate(true, 'No User Found', 404, null)
                            //res.send(apiResponse)
                        } else {
                            console.log('LIST OF FRIENDS', result);
                            //let apiResponse = response.generate(false, 'All user Details Found', 200, result)
                            //res.send(result)
                            for(let item of result) {
                                let userDetails = {
                                    'message':'',
                                    'todo': true,
                                    'data': data,
                                    'created': false
                                }
                                if(item.requestedById === data.userId && item.status === 'ACCEPTED') {
                                    //userDetails.message = `${data.toDoName} todo is updated by ${item.requestedByName}`
                                    userDetails.todo = true;
                                    let arrayDetails = userDetails.data.history;
                                       var val = arrayDetails[arrayDetails.length - 1]; // 6
                                       userDetails.message = val;
                                       console.log('requestedById', val);                                 
                                    io.emit(item.requestedToId, userDetails)
                                    //console.log(`${data.toDoName} is updated by ${item.requestedByName}`)
                                    console.log('requestedToId',userDetails);
                                } else if(item.requestedToId === data.userId && item.status === 'ACCEPTED'){
                                    //userDetails.message= `${data.toDoName} is updated by ${item.requestedToName}`
                                    userDetails.todo = true;   
                                    let arrayDetails = userDetails.data.history;
                                       var val = arrayDetails[arrayDetails.length - 1]; // 6
                                       userDetails.message = val;
                                        console.log('requestedById', userDetails);                                 
                                    io.emit(item.requestedById, userDetails)
                                    console.log(`${data.toDoName} is updated by ${item.requestedToName}`)
                                    console.log('requestedById',userDetails);

                                }
                            }
                            let userDetails = {
                                'message':'',
                                'todo': true,
                                'data': data,
                                'created': false
                            }
                            let arrayDetails = userDetails.data.history;
                            var val = arrayDetails[arrayDetails.length - 1]; // 6
                                userDetails.message = val;
                            io.emit(data.userId, userDetails);
                        }
                    })
               // })
            }, 2000);
        }


    });

}

eventEmitter.on('save-event', (req, res) => {

    console.log('save-event', req);
    let newFriend = new Friend({
        requestedById: req.requestedById,
        requestedToId: req.requestedToId,
        status: req.status,
        id: shortid.generate(),
        requestedByName: req.requestedByName,
        requestedToName: req.requestedToName

    })

    newFriend.save((err, result)=> {
        if(err) {
            logger.error(err.message, 'userController: addfriendsDetails', 10)
            let apiResponse = response.generate(true, 'Failed to send request', 500, null)
            //res.send(apiResponse)
        } else if(check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'No Result Found', 404, null)
            //res.send(apiResponse)

        } else {
            let apiResponse = response.generate(false, 'Friend Request Sent Successfully', 200, null)
            //res.send(apiResponse);
            //console.log('Friend request', apiResponse);
        }
    })

})

eventEmitter.on('friendship', (req, res) => {

    let options = req
    //console.log('oooooooo',options);
        Friend.update({'id':req.id}, options)
        .exec((err, result) => {
            if(err) {
                let apiResponse = response.generate(true, 'Failed to update friends', 500, null)
                //res.send(apiResponse)
            } else if(check.isEmpty(result)) {
                let apiResponse = response.generate(true, 'No Result Found', 404, null)
                //res.send(apiResponse)
            } else {
               // console.log('result', result);
                let apiResponse = response.generate(false, 'Friends Details Updated Successfully', 200, result)
                //res.send(apiResponse)
                console.log('Added friend', apiResponse);
            }
        })
})

module.exports = {
    setServer: setServer,
    eventAlerts:eventAlerts

}
