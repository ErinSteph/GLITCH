/*------ require ------**
Express: $ npm install express --save
Ector: $ npm install ector
Merge: npm install merge --save
MySQL: npm install mysql
Discordio: npm install discord.io
**---------------------*/

var express = require('express')
var app = express()
var Ector = require('ector')
const ector = new Ector("Glitch", "User")
const fs = require('fs')
var merge = require('merge')
var mysql = require('mysql')
var Discord = require('discord.io')


var table = 'glitch' // name of the database table
var token = '' //bot token
var botid = 290551071787450368 // bot id

//-------- lib --------//

var bot = new Discord.Client({
    token: token,
    autorun: true
});

var pool  = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  user            : '',
  password        : '',
  database        : 'GLITCH'
})

pool.getConnection(function(err, connection){
  connection.release()
  if(err){
    console.error(time() + ' <> ' + ' error connecting GLITCH database: ' + err.stack)
    return
  }
  console.log(time() + ' <> ' + ' GLITCH database connected.')
});

function time(){
  var date = new Date()
  var Y = date.getFullYear()
  var M = date.getMonth() + 1
  var D = date.getDate()
  var h = date.getHours()
  var m = date.getMinutes()
  return D + '/' + M + '/' + Y + ' ' + h + ':' + m
}

function save(){
  pool.getConnection(function(err, connection){
    ready = JSON.stringify(ector.cn)
    var sql = "UPDATE cn SET ?? = ? WHERE ?? = ?"
    var inserts = ['data', ready , 'id', table]
    sql = mysql.format(sql, inserts)
    connection.query(sql, function (error, results, fields){
      if (error) throw error
    })
  })
}

function load(){
  var loadcn;
  pool.getConnection(function(err, connection){
    connection.query('SELECT * FROM `cn` WHERE `id`=?', [table], function (error, results, fields){
      if (error) throw error
      if(results.length > 0){
        loadcn = JSON.parse(results[0].data)
        ector.cns = {}
        ector.cn = merge(ector.cn, loadcn)
        console.log(time() + ' <> ' + ' GLITCH concept network storage loaded and ready.')
      }else{
        oldcn = '[]'
        loadcn = JSON.parse(oldcn)
        ector.cns = {}
        ector.cn = merge(ector.cn, loadcn)
        var sql = "INSERT INTO cn SET ?";
        var q = [{id: table, data: oldcn}]
        sql = mysql.format(sql, q);
        connection.query(sql, function (error, results, fields) {
          if (error) throw error
          console.log(time() + ' <> ' + ' GLITCH concept network storage created and ready.')
        })
      }
      connection.release()
    })
  })
  ector.setUser("User")
}

//--------- init ---------//

var previousResponseNodes = null
load()

//--------- app ---------//

bot.on('message', function(user, userID, channelID, message, event) {
  console.log(time() + ' <' + user + '> ' + message)
  ector.setUser(user)
  ector.addEntry(message)
  ector.linkNodesToLastSentence(previousResponseNodes)
  var response = ector.generateResponse()
  previousResponseNodes = response.nodes
  save()
  if(userID != 290551071787450368){
    bot.sendMessage({
      to: channelID,
      message: response.sentence
    });
  }
});


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get('/:name/:data', function (req, res) {
  var name = decodeURIComponent(req.params.name)
  var msg = decodeURIComponent(req.params.data)
  console.log(time() + ' <' + name + '> ' + msg)
  ector.setUser(name)
  ector.addEntry(msg)
  ector.linkNodesToLastSentence(previousResponseNodes)
  var response = ector.generateResponse()
  console.log(time() + ' <Glitch> ' + response.sentence)
  previousResponseNodes = response.nodes
  res.send(response.sentence)
  save()
})


//--------- launch ---------//

app.listen(3000, function () {
  console.log(time() + ' <> GLITCH listening on port 3000.')
})