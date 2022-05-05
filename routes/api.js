/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
const mongoose = require('mongoose')
const mongo = require('mongodb')

module.exports = function(app) {

  mongoose.connect(
    process.env['MONGO_URI'], {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )

  const connection = mongoose.connection;
  connection.once('open', () => console.log('Successfully connected to MongoDB.'))

  const { Schema, Types } = mongoose;

  const issueSchema = new Schema({
    title: { type: String },
    comments: { type: Array },
    commentcount: { type: Number, default: 0 }
  })

  const BOOKS = mongoose.model('BOOKS', issueSchema);

  app.route('/api/books')
    .get(function(req, res) {
      BOOKS.find((err, books) => {
        let books_list = books.map(book => {
          return {
            _id: book._id,
            title: book.title,
            commentcount: book.commentcount
          }
        })
        res.send(books_list)
      })

    })

    .post(function(req, res) {
      let title = req.body.title
      if (title == undefined || title == null || title == '') {
        console.log('ok')
        res.send('missing required field title')
      } else {
        let newBook = new BOOKS({ title: req.body.title })
        newBook.save((err, book) => {
          res.send({
            _id: book._id,
            title: book.title
          })
        })
      }

    })

    .delete(function(req, res) {
      BOOKS.deleteMany((err, count) => {
        if (err) {
          console.log(err.message)
        } else {
          res.send('complete delete successful')
        }
      })
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function(req, res) {
      let bookid = req.params.id;
      BOOKS.find({ _id: bookid }, (err, book) => {
        if (err) {
          console.log(err)
        } else {
          if (!book.length) {
            res.send('no book exists')
          } else {
            res.send({
              _id: book[0]._id,
              title: book[0].title,
              comments: book[0].comments
            })
          }
        }
      })
    })

    .post(function(req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;

      console.log(comment)
      if (comment == undefined || comment == null || comment == '') {
        res.send('missing required field comment')
      } else {
        BOOKS.findOneAndUpdate(
          { _id: bookid },
          {
            $push: { comments: comment },
            $inc: { commentcount: 1 }
          },
          { new: true },
          (err, book) => {
            if (err) {
              res.send('no book exists')
            } else {
              if (book == null) {
                res.send('no book exists')
              } else {
                res.send({
                  _id: book._id,
                  title: book.title,
                  comments: book.comments
                })
              }
            }
          })
      }
    })

    .delete(function(req, res) {
      let bookid = req.params.id;

      BOOKS.deleteOne({ _id: bookid }, (err, count) => {
        if (err) {
          console.log(err)
        } else if (count.deletedCount == 0) {
          res.send('no book exists')
        } else {
          res.send('delete successful')
        }
      })
    });

};
