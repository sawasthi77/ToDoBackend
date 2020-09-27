const mongoose = require('mongoose')
const Schema = mongoose.Schema
const time = require('../libs/timeLib')


const Todo = new Schema ({
    userId: {
        type: String
      },
      toDoName: {
        type: String
      },
      status: {
        type: String
      },
      toDostatus: {
        type: String
      },
      toDoItemId: {
        type: String,
      },
      subToDoItems: [
          {
              subToDoName: {
                  type: String
              },
              subToDoItemId: {
                  type: String
              }
          }
      ],
      history : []
})

module.exports = mongoose.model('Todo', Todo)
