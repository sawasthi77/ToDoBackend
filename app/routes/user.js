const express = require('express');
const router = express.Router();
const userController = require("./../../app/controllers/userController");

const appConfig = require("./../../config/appConfig")
const auth = require("./../middlewares/auth")

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;

    // defining routes.


    app.post(`${baseUrl}/signup`, userController.signUpFunction);

    /**
     * @api {post} /api/v1/signup api for user signup.
     * @apiVersion  0.0.1
     * @apiGroup Signup
     * @apiParam {string} firstName firstName of the user. (body params) (required)
     * @apiParam {string} lastName lastName of the user. (body params) (required)
     * @apiParam {string} email email of the user. (body params) (required)
     * @apiParam {string} mobileNumber mobileNumber of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     * 
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "User created",
            "status": 200,
            "data": {
                email: "wewew@ewe.wew"
                firstName: "wee"
                lastName: "wewe"
                mobileNumber: 1122221121
                userId: "2CN47IUf4"
            }

        }
    }

    @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Email entered is incorrect format,
	    "status": 400,
	    "data": null
	   }
	 
    */




    app.post(`${baseUrl}/login`, userController.loginFunction);
    /**
     * @api {post} /api/v1/login api for user login.
     * @apiVersion  0.0.1
     * @apiGroup Login
     *
     * @apiParam {string} email email of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Login Successful",
            "status": 200,
            "data": {
                "authToken": "eyJhbGciOiJIUertyuiopojhgfdwertyuVCJ9.MCwiZXhwIjoxNTIwNDI29tIiwibGFzdE5hbWUiE4In19.hAR744xIY9K53JWm1rQ2mc",
                "userDetails": {
                "mobileNumber": 2234435524,
                "email": "someone@mail.com",
                "lastName": "Sengar",
                "firstName": "Rishabh",
                "userId": "-E9zxTYA8"
            }

        }
    }

    @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Wrong password, Login failed,
	    "status": 400,
	    "data": null
	   }
	 
    */

    


   app.post(`${baseUrl}/logout`, auth.isAuthorized, userController.logout);
    /**
     * @apiGroup logout
     * @apiVersion  0.0.1
     * @api {post} /api/v1/users/logout   logout
     *
     * @apiParam {string} userId userId of the user. (auth headers) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Logged Out Successfully",
            "status": 200,
            "data": null

        }

        @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Already Logout",
	    "status": 400,
	    "data": null
	   }
    */


    app.get(`${baseUrl}/:userId/all`, auth.isAuthorized, userController.getAllDetails);

    /**
     * @apiGroup users
     * @apiVersion  0.0.1
     * @api {get} /api/v1/userId/all get all user details.
     *
     * @apiParam {string} userId userId of the user. (params) (required)
     * @apiParam {string} Authorization Authorization of the user. (header params) (required)  
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         [{
             email: "chaitanya@todo.com"
            firstName: "chaitanya"
            lastName: "vulchi"
            mobileNumber: 11111111111
            userId: "T5Q-TzoRi"
        },
        {
             email: "chaitanya@todo.com"
            firstName: "chaitanya"
            lastName: "vulchi"
            mobileNumber: 11111111111
            userId: "T5Q-TzoRi"
        }]

     * @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "No User Found",
	    "status": 400,
	    "data": null
	   }
    */


    
    app.post(`${baseUrl}/friendsDetails`, auth.isAuthorized, userController.addfriendsDetails);

      /**
     * @apiGroup friendsDetails
     * @apiVersion  0.0.1
     * @api {post} /api/v1/friendsDetails get all friendsDetails.
     * @apiParam {string} Authorization Authorization of the friends. (auth headers) (required)
     * @apiParam {string} requestedById requestedById of the friends.  (send in body)
     * @apiParam {string} requestedByName requestedByName of the friends. (send in body) (required) 
     * @apiParam {string} requestedToId requestedToId of the friends. (send in body) (required) 
     * @apiParam {string} requestedToName requestedToName of the friends. (send in body) (required) 
     * @apiParam {string} status status of the friends. (send in body) (required) 
     * @apiParam {object} requestedUserDetails requestedUserDetails of the friends. (send in body) (required) 
     * 
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
     * {
            data: null
            error: false
            message: "Friend Request Sent Successfully"
            status: 200
     * }
             

     * @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "No Result Found",
	    "status": 404,
	    "data": null
	   }
    */

    app.get(`${baseUrl}/:userId/details`, auth.isAuthorized, userController.getUserById);

     /**
     * @apiGroup friendsDetails
     * @apiVersion  0.0.1
     * @api {get} /api/v1/ikjjduh/details get all details.
     * @apiParam {string} Authorization Authorization of the friends. (auth headers) (required)
     * @apiParam {string} userId userId of the friends.  (params)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
     
     * data: [{
                email: "chaitanya@todo.com"
                firstName: "chaitanya"
                lastName: "vulchi"
                mobileNumber: 11111111111
                userId: "T5Q-TzoRi"
            }]
            error: false
            message: "All user Details Found"
            status: 200
             

     * @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "No Result Found",
	    "status": 404,
	    "data": null
	   }
    */

    app.get(`${baseUrl}/:userId/friendsDetails`, auth.isAuthorized, userController.getFriendDetails);

      /**
     * @apiGroup friendsDetails
     * @apiVersion  0.0.1
     * @api {get} /api/v1/ikjjduh/friendsDetails get friend Details.
     * @apiParam {string} Authorization Authorization of the friends. (auth headers) (required)
     * @apiParam {string} userId userId of the friends.  (params)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
     
     * data: [{
                 id: "vheTrgAKs"
                requestedById: "2CN47IUf4"
                requestedByName: "wee"
                requestedToId: "T5Q-TzoRi"
                requestedToName: "chaitanya"
                status: "PENDING"
            }]
            error: false
            message: "Friend Details Found"
            status: 200
             

     * @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "No Result Found",
	    "status": 404,
	    "data": null
	   }
    */

    app.post(`${baseUrl}/updatefriendsDetails`, auth.isAuthorized, userController.updateFriendsDetails);

 /**
     * @apiGroup updatefriendsDetails
     * @apiVersion  0.0.1
     * @api {post} /api/v1/updatefriendsDetails update Friend Details.
     * @apiParam {string} Authorization Authorization of the friends. (auth headers) (required)
     * @apiParam {string} id id of the friends.  (body)
     * @apiParam {string} requestedById requestedById of the friends.  (body)
     * @apiParam {string} requestedByName requestedByName of the friends.  (body)
     * @apiParam {string} requestedToId requestedToId of the friends.  (body)
     * @apiParam {string} requestedToName requestedToName of the friends.  (body)
     * @apiParam {string} status status of the friends.  (body)
     * 
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
     
     * data: {}
            error: false
            message: "Friends Details Updated Successfully"
            status: 200

             

     * @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "No Result Found",
	    "status": 404,
	    "data": null
	   }
    */

  

    app.post(`${baseUrl}/addtodolist`, auth.isAuthorized, userController.addToDoList);

    /**
     * @apiGroup addtodolist
     * @apiVersion  0.0.1
     * @api {post} /api/v1/addtodolist Addtodolist.
     * @apiParam {string} Authorization Authorization of the friends. (auth headers) (required)
     * @apiParam {string} userId userId of the friends.  (body)
     * @apiParam {string} toDostatus toDostatus of the friends.  (body)
     * @apiParam {string} toDoName toDoName of the friends.  (body)
     * @apiParam {string} toDoItemId toDoItemId of the friends.  (body)
     * @apiParam {array} subToDoItems subToDoItems of the friends.  (body)
     * @apiParam {string} status status of the friends.  (body)
     * @apiParam {array} history history of the friends.  (body)    
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
     
     data: {
        history: ["m Created by srikanth"]
        status: "Open"
        subToDoItems: []
        toDoItemId: "Vmy67gel0"
        toDoName: "m"
        toDostatus: "Created"
        userId: "U0xgkHKsu"
        __v: 0
        _id: "5bfd62b9b7291f08f8deae10"
     }
        error: false
        message: "New newTodoList generated"
        status: 200

             

     * @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "No Result Found",
	    "status": 404,
	    "data": null
	   }
    */

    app.get(`${baseUrl}/:userId/gettodolist`, auth.isAuthorized, userController.getToDoList);

    /**
     * @apiGroup gettodolist
     * @apiVersion  0.0.1
     * @api {post} /api/v1/gettodolist get todo list.
     * @apiParam {string} Authorization Authorization of the friends. (auth headers) (required)
     * @apiParam {string} userId userId of the friends.  (params)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
     
        data: [{history: ["n Created by srikanth", "seduce Edited by srikanth", "one Edited by srikanth"]
            status: "Done"
            subToDoItems: []
            toDoItemId: "LcQW6o8sU"
            toDoName: "one"
            toDostatus: "Edited"
            userId: "U0xgkHKsu"}] 
        error: false
        message: "User Todo List"
        status: 200

             

     * @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "No Result Found",
	    "status": 404,
	    "data": null
	   }
    */

    app.put(`${baseUrl}/updatetodolist`, auth.isAuthorized, userController.updateToDoList);

    /**
     * @apiGroup updatetodolist
     * @apiVersion  0.0.1
     * @api {put} /api/v1/updatetodolist Updatetodolist.
     * @apiParam {string} Authorization Authorization of the friends. (auth headers) (required)
     * @apiParam {string} userId userId of the friends.  (body)
     * @apiParam {string} toDostatus toDostatus of the friends.  (body)
     * @apiParam {string} toDoName toDoName of the friends.  (body)
     * @apiParam {string} toDoItemId toDoItemId of the friends.  (body)
     * @apiParam {array} subToDoItems subToDoItems of the friends.  (body)
     * @apiParam {string} status status of the friends.  (body)
     * @apiParam {array} history history of the friends.  (body)    
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
     
     data: {
        history: ["m Created by srikanth"]
        status: "Open"
        subToDoItems: []
        toDoItemId: "Vmy67gel0"
        toDoName: "m"
        toDostatus: "Edited"
        userId: "U0xgkHKsu"
        __v: 0
        _id: "5bfd62b9b7291f08f8deae10"
     }
        error: false
        message: "New newTodoList generated"
        status: 200

             

     * @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "No Result Found",
	    "status": 404,
	    "data": null
	   }
    */

    app.delete(`${baseUrl}/:toDoItemId/deleteToDoList`, auth.isAuthorized, userController.deleteToDoList);

    /**
     * @apiGroup addtodolist
     * @apiVersion  0.0.1
     * @api {post} /api/v1/addtodolist to addtodolist.
     * @apiParam {string} Authorization Authorization of the friends. (auth headers) (required)
     * @apiParam {string} userId userId of the friends.  (body)
     * @apiParam {string} toDostatus toDostatus of the friends.  (body)
     * @apiParam {string} toDoName toDoName of the friends.  (body)
     * @apiParam {string} toDoItemId toDoItemId of the friends.  (body)
     * @apiParam {array} subToDoItems subToDoItems of the friends.  (body)
     * @apiParam {string} status status of the friends.  (body)
     * @apiParam {array} history history of the friends.  (body)    
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
     
     data: {
        history: ["m Created by srikanth"]
        status: "Open"
        subToDoItems: []
        toDoItemId: "Vmy67gel0"
        toDoName: "m"
        toDostatus: "Deleted"
        userId: "U0xgkHKsu"
        __v: 0
        _id: "5bfd62b9b7291f08f8deae10"
     }
        error: false
        message: "New newTodoList generated"
        status: 200

             

     * @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "No Result Found",
	    "status": 404,
	    "data": null
	   }
    */
      

    app.post(`${baseUrl}/forgot-password`, userController.forgotPassword);

     /**
     * @apiGroup forgot-password
     * @apiVersion  0.0.1
     * @api {post} /api/v1/forgot-password  Forgot-password.
     * @apiParam {string} email email of the friends.  (body)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
     
     * data: {}
            error: false
            message: "Friends Details Updated Successfully"
            status: 200

            data: {
                code: "so3hddyKr"
                email: "srikanth@todo.com"
                userId: "U0xgkHKsu"
                }
                error: false
                message: "Email Sent Successfully"
                status: 200

             

     * @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "No Result Found",
	    "status": 404,
	    "data": null
	   }
    */


}
