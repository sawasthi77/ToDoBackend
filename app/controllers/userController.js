const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib')
const check = require('../libs/checkLib')
const passwordlib = require('./../libs/generatePasswordLib')
const token = require('./../libs/tokenLib')
const AuthModal = require('./../models/Auth')
const socketLib = require('../libs/socketLibs');


/* Models */
const UserModel = mongoose.model('User')
const Friend = mongoose.model('Friend')
const Todo = mongoose.model('Todo')
const CodeModel = mongoose.model('Code');


// start user signup function 

let signUpFunction = (req, res) => {

    let validateUserInput = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                if (!validateInput.Email(req.body.email)) {
                    let apiResponse = response.generate(true, 'Email entered is incorrect format', 400, null)
                    reject(apiResponse)
                } else if (check.isEmpty(req.body.password)) {
                    let apiResponse = response.generate(true, 'Email entered is incorrect format', 400, null)
                    reject(apiResponse)
                } else {
                    resolve(req);
                }
            } else {
                logger.error('Field Missing During User Creation', 'userController: createUser()', 5)
                let apiResponse = response.generate(true, 'One or More Parameter(s) is missing', 400, null)
                reject(apiResponse)
            }
        })
    }

    let createUser = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ email: req.body.email })
                .exec((err, retriveDetails) => {
                    if (err) {
                        logger.error(err.message, 'userController: createUser', 10)
                        let apiResponse = response.generate(true, 'Failed to create new User', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(retriveDetails)) {
                        
                        let newUser = new UserModel({
                            userId: shortid.generate(),
                            firstName: req.body.firstName,
                            lastName: req.body.lastName || '',
                            email: req.body.email.toLowerCase(),
                            mobileNumber: req.body.mobileNumber,
                            password: passwordlib.hashpassword(req.body.password),
                            created: time.now()
                        })
                        newUser.save((err, newUser) => {
                            if (err) {
                                logger.error(err.message, 'userController: createUser', 10)
                                let apiResponse = response.generate(true, 'Failed to create new User', 500, null)
                                reject(apiResponse)
                            } else {
                                let newObj = newUser.toObject()
                                //console.log('newUser', newUser)
                                resolve(newObj)
                            }
                        })
                    } else {
                        logger.error('User Cannot Be Created.User Already Present', 'userController: createUser', 4)
                        let apiResponse = response.generate(true, 'User Already Present With this Email', 403, null)
                        reject(apiResponse)
                    }
                })
        })
    }

    validateUserInput(req, res)
        .then(createUser)
        .then((resolve, reject) => {
            delete resolve.password
            let apiResponse = response.generate(false, 'User created', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            //console.log(err);
            res.send(err);
        })

}// end user signup function 

// start of login function 
let loginFunction = (req, res) => {

    //console.log('this is login')

    let findUser = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                UserModel.findOne({ email: req.body.email }, (err, userDetails) => {
                    if (err) {
                     //   console.log(err);
                        logger.error('unable to retrive user details', 'finduser()', 10)
                        let apiResponse = response.generate(true, 'unable to retrive user details', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(userDetails)) {
                        logger.error('No User Found', 'userController: findUser()', 7)
                        let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                        reject(apiResponse)
                    } else {
                        logger.info('user found', 'finduser()', 10)
                        resolve(userDetails)
                    }
                })
            } else {
                let apiResponse = response.generate(true, 'Email parameter is missing', 400, null)
                reject(apiResponse)
            }
        })
    }

    let validatePassword = (retriveUserDetails) => {

        return new Promise((resolve, reject) => {
           // console.log('entered password', req.body.password)
           // console.log('retriveUserDetails.password', retriveUserDetails.password)

            passwordlib.comparePassword(req.body.password, retriveUserDetails.password, (err, isMatch) => {
                if (err) {
                  //  console.log(err);
                    logger.error('unable to retrive user details', 'validatePassword()', 10)
                    let apiResponse = response.generate(true, 'unable to retrive user details', 500, null)
                    reject(apiResponse)
                } else if (isMatch) {
                    let detailsObject = retriveUserDetails.toObject()
                    delete detailsObject.password
                    delete detailsObject._id
                    delete detailsObject.__v
                    delete detailsObject.createdOn
                    delete detailsObject.modifiedOn
                    resolve(detailsObject)
                } else {
                  //  console.log(err);
                    logger.error('Wrong password, Login failed', 'validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Wrong password, Login failed', 400, null)
                    reject(apiResponse)
                }
            })
        })
    }

    let generateToken = (userDetails) => {
        //console.log("generate token", userDetails);

        return new Promise((resolve, reject) => {
            token.generateToken(userDetails, (err, tokenDetails) => {
                if (err) {
                    logger.error('unable to retrive token details', 'validatePassword()', 10)
                    let apiResponse = response.generate(true, 'unable to retrive token details', 500, null)
                    reject(apiResponse)
                } else {
                    tokenDetails.userId = userDetails.userId
                    tokenDetails.userDetails = userDetails
                    resolve(tokenDetails)
                }
            })
        })
    }

    let saveToken = (tokenDetails) => {
        return new Promise((resolve, reject) => {
            AuthModal.findOne({ userId: tokenDetails.userId }, (err, retriveTokenDetails) => {
                if (err) {
                    logger.error('unable to retrive token user details', 'validatePassword()', 10)
                    let apiResponse = response.generate(true, 'unable to retrive token user details', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(retriveTokenDetails)) {
                    let newUserDetails = new AuthModal({
                        userId: tokenDetails.userDetails.userId,
                        authToken: tokenDetails.token,
                        tokenSecret: tokenDetails.tokenSecret,
                        tokenGenerationTime: time.now()
                    })
                    newUserDetails.save((err, newTokenDetails) => {
                        if (err) {
                         //   console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })
                } else {
                    retriveTokenDetails.authToken = tokenDetails.token
                    retriveTokenDetails.tokenSecret = tokenDetails.tokenSecret
                    retriveTokenDetails.tokenGenerationTime = time.now()
                    retriveTokenDetails.save((err, newTokenDetails) => {
                        if (err) {
                           // console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })

                }
            })
        })
    }


    findUser(req, res)
        .then(validatePassword)
        .then(generateToken)
        .then(saveToken)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Login Successful', 200, resolve)
            res.status(200)
            res.send(apiResponse)

        })
        .catch((err) => {
           // console.log("errorhandler");
           // console.log(err);
            res.status(err.status)
            res.send(err)
        })
    
}

let getAllDetails = (req, res) => {
    // console.log('getAllDetails',req);
     UserModel.find({'userId': { $ne: req.params.userId}}).select(' -__v -_id -password').lean().exec((err, result) => {
         if(err) {
             let apiResponse = response.generate(true, 'Failed to find users', 500, null)
             res.send(apiResponse)
         } else if (check.isEmpty(result)) {
             let apiResponse = response.generate(true, 'No User Found', 404, null)
             res.send(apiResponse)
         } else {
             //let apiResponse = response.generate(false, 'All user Details Found', 200, result)
             res.send(result)
         }
     })
 } // end of getAllDetails


 let addfriendsDetails = (req, res) => {

   console.log('addfriendsDetails',req.body);
    let newFriend = new Friend({
        requestedById: req.body.requestedById,
        requestedToId: req.body.requestedToId,
        status: req.body.status,
        id: shortid.generate(),
        requestedByName: req.body.requestedByName,
        requestedToName: req.body.requestedToName

    })

    newFriend.save((err, result)=> {
        if(err) {
            logger.error(err.message, 'userController: addfriendsDetails', 10)
            let apiResponse = response.generate(true, 'Failed to send request', 500, null)
            res.send(apiResponse)
        } else if(check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'No Result Found', 404, null)
            res.send(apiResponse)

        } else {
            console.log('RESULT', result);
            console.log('NEWFRIEND', newFriend);
            socketLib.eventAlerts.addfriend(newFriend);
            let apiResponse = response.generate(false, 'Friend Request Sent Successfully', 200, null)
            res.send(apiResponse);
        }
    })
 }


 let updateFriendsDetails = (req ,res) => {
    let options = req.body
//console.log('oooooooo',options);
    Friend.update({'id':req.body.id}, options)
    .exec((err, result) => {
        if(err) {
            let apiResponse = response.generate(true, 'Failed to update friends', 500, null)
            res.send(apiResponse)
        } else if(check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'Unable to add friendship', 404, null)
            res.send(apiResponse)
        } else {
           // console.log('result', result);
           socketLib.eventAlerts.acceptFriendship(req.body)
            let apiResponse = response.generate(false, 'Friends Details Updated Successfully', 200, result)
            res.send(apiResponse)
        }
    })
 }
 
 let getFriendDetails = (req, res) => {
     //console.log(req.params.userId);
    Friend.find({$or: [{'requestedById': req.params.userId}, {'requestedToId': req.params.userId}]}).select(' -__v -_id').lean().exec((err, result) => {
        if(err) {
            let apiResponse = response.generate(true, 'Failed to find users', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'No User Found', 404, null)
            res.send(apiResponse)
        } else {
           // console.log(result);
            let apiResponse = response.generate(false, 'Friend Details Found', 200, result)
            res.send(apiResponse)
        }
    })
 }

let getUserById = (req, res) => {
    UserModel.find({'userId': req.params.userId}).select(' -__v -_id -password').lean().exec((err, result) => {
        if(err) {
            let apiResponse = response.generate(true, 'Failed to find users', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'No User Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'All user Details Found', 200, result)
            res.send(apiResponse)
        }
    })
}

let addToDoList = (req, res) => {
    
    let newTodoList = new Todo({
        userId: req.body.userId,
        toDoName: req.body.toDoName,
        status: req.body.status,
        toDoItemId: shortid.generate(),
        subToDoItems: req.body.subToDoItems,
        history: req.body.history,
        toDostatus: req.body.toDostatus
    })

    newTodoList.save((err, result)=> {
        if(err) {
            logger.error(err.message, 'userController: addfriendsDetails', 10)
            let apiResponse = response.generate(true, 'Failed to send request', 500, null)
            res.send(apiResponse)
        } else if(check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'No Result Found', 404, null)
            res.send(apiResponse)
        } else {
            socketLib.eventAlerts.newToDo(newTodoList);
            let apiResponse = response.generate(false, 'New newTodoList generated', 200, result)
            res.send(apiResponse);
        }
    })
}

let getToDoList = (req, res) => {
    Todo.find({'userId':req.params.userId}).select().lean().exec((err, result) => {
        if(err) {
            let apiResponse = response.generate(true, 'Failed to find users', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'No User Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'User Todo List', 200, result)
            res.send(apiResponse)
        }
    })
}

let updateToDoList = (req, res) => {
    let options = req.body;
    Todo.update({'toDoItemId': req.body.toDoItemId}, options)
    .exec((err, result) => {
        if(err) {
            let apiResponse = response.generate(true, 'Failed to update Todo', 500, null)
            res.send(apiResponse)
        } else if(check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'No User Found', 404, null)
            res.send(apiResponse)
        } else {
            socketLib.eventAlerts.updateToDo(req.body);
            let apiResponse = response.generate(false, 'Todo Updated Successfully', 200, result)
            res.send(apiResponse)
        }
    })
}

let deleteToDoList = (req, res) => {
    Todo.findOneAndRemove({'toDoItemId': req.params.toDoItemId})
    .exec((err, result) => {
        if(err) {
            let apiResponse = response.generate(true, 'Failed to Delete Todo', 500, null)
            res.send(apiResponse)
        } else if(check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'No Event Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Todo Successfully Deleted', 200, result)
            res.send(apiResponse)
        }
    })
}
// end of the login function 


let logout = (req, res) => {
   // console.log('REQ', req.body);
    AuthModal.findOneAndRemove({userId: req.body.userId}, (err, result) => {
       // console.log('ERROR ********* \n', result)
    
        if(err) {
            logger.error(err, 'userController: saveToken', 10)
            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
            res.send(apiResponse)
        } else if(check.isEmpty(result)) {
            logger.error(err, 'userController: saveToken', 10)
            let apiResponse = response.generate(true, 'Already Logout', 404, null)
            res.send(apiResponse)
        } else {
           // socketLib.eventAlerts.logout(req.body.userId);
            let apiResponse = response.generate(false, 'Logout successfuly', 200, null)
            res.send(apiResponse)
        }
    });
  
} // end of the logout function.




let forgotPassword = (req,res) => {

    findUser = () => {
        return new Promise((resolve, reject) => {

            UserModel.find({email: req.body.email}).select(' -__v -_id').lean().exec((err, result) => {
                if(err) {
                    let apiResponse = response.generate(true, 'Failed to find users', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(result)) {
                    let apiResponse = response.generate(true, 'No User Found', 404, null)
                    reject(apiResponse)
                } else {
                    let apiResponse = response.generate(false, 'Email Fund', 200, result)
                    resolve(result)
                    //console.log('apiResponse',result[0].password);
                  //  console.log('Data.password',apiResponse.data.password);
        
                }
        })
    })

}


   let generateCode = (retriveDetails) => {
    //console.log('retriveDetails', retriveDetails);

    return new Promise((resolve, reject) => {

        let codeDetails = new CodeModel({
            userId: retriveDetails[0].userId,
            email: retriveDetails[0].email,
            code: shortid.generate()
        })

       // console.log('CODEDETAILS', codeDetails);

        codeDetails.save((err, result) => {
            if (err) {
                logger.error(err.message, 'userController: createUser', 10)
                let apiResponse = response.generate(true, 'Failed to create new User', 500, null)
                reject(apiResponse)
            } else {
                let newObj = result.toObject()
               // console.log('NEWCODE', newObj)
                resolve(newObj)
            }
        })
    })       
   }

    findUser(req, res)
    .then(generateCode)
    .then((resolve) => {
        
        delete resolve._id;
        delete resolve.__v;
    })
    .catch((err) => {
       // console.log("errorhandler");
       // console.log(err);
        res.status(err.status)
        res.send(err)
    })



} // end of password


module.exports = {

    signUpFunction: signUpFunction,
    loginFunction: loginFunction,
    logout: logout,
    forgotPassword: forgotPassword,
    getAllDetails: getAllDetails,
    addfriendsDetails: addfriendsDetails,
    getUserById: getUserById,
    getFriendDetails: getFriendDetails,
    updateFriendsDetails: updateFriendsDetails,
    addToDoList: addToDoList,
    getToDoList: getToDoList,
    updateToDoList: updateToDoList,
    deleteToDoList: deleteToDoList

}// end exports