const { comment } = require('../models/comment');
const Joi = require('joi');
const knex = require('../db');
const _ = require('lodash');
const express = require('express') ;
const app = express() ;
const { Server } = require('socket.io');
const http = require('http');

const server = http.createServer(app);
const io = new Server(server);

exports.createComment = async (req , res) => {
    const schema = Joi.object({
        content : Joi.string().required() 
    }) ;
    const newComment = req.body ;

    const { error } = schema.validate(newComment) ;
    if (error) return res.status(400).send({'message' : error.details[0].message}) ;

    newComment.user_id = req.user.id ;
    newComment.product_id = req.params.id ;

    const Comment = new comment(newComment) ;

    io.on('connection', (socket) => {
        socket.on('commentNotification', async (data) => {  
          try {
            await Comment.save() ;
            res.status(200).send({ "message" : "Created Comment successfully" })
            // Broadcast the new comment notification to all connected clients
            io.emit('commentNotification', newComment); // Adjust data structure as needed
          } catch (error) {
            console.log(e) ;
            return res.status(400).send({'message' : e}) ;
          }
        });
      });
}