/*------ require ------**
Express: $ npm install express --save
Ector: $ npm install ector
Merge: npm install merge --save
MySQL: npm install mysql
**---------------------*/

var express = require('express')
var app = express()
var Ector = require('ector')
const ector = new Ector("GLITCH", "User")
const fs = require('fs')
var merge = require('merge')
var mysql = require('mysql')

//-------- lib --------//

var pool  = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  user            : 'root',
  password        : 'erinxnoot',
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
    var sql = "UPDATE cn SET ?? = ? WHERE ?? = ?";
    var inserts = ['data', ready , 'id', 'concept'];
    sql = mysql.format(sql, inserts);
    connection.query(sql, function (error, results, fields){
      if (error) throw error
    })
  })
}

function load(){
  var loadcn;
  pool.getConnection(function(err, connection){
    connection.query('SELECT * FROM `cn` WHERE `id`="concept"', function (error, results, fields){
      if(error){
        throw error
      }
      if(results.length > 0){
        loadcn = JSON.parse(results[0].data)
        ector.cns = {}
        ector.cn = merge(ector.cn, loadcn)
      }else{
        oldcn = '[]'
        loadcn = JSON.parse(oldcn)
        ector.cns = {}
        ector.cn = merge(ector.cn, loadcn)
        var sql = "INSERT INTO cn SET ?";
        var q = [{id: 'concept', data: oldcn}]
        sql = mysql.format(sql, q);
        connection.query(sql, function (error, results, fields) {
          if (error) throw error
          console.log(time() + ' <> ' + ' GLITCH concept network storage ready.')
        })
      }
      connection.release()
    })
  })
  ector.setUser("User")
  console.log(time() + ' <> ' + ' GLITCH concept network online.')  
}

//--------- init ---------//

var previousResponseNodes = null
load()

//--------- app ---------//

app.get('/:name/:data', function (req, res) {
  var name = decodeURIComponent(req.params.name)
  var msg = decodeURIComponent(req.params.data)
  console.log(time() + ' <' + name + '> ' + msg)
  ector.setUser(name)
  ector.addEntry(msg)
  ector.linkNodesToLastSentence(previousResponseNodes)
  var response = ector.generateResponse()
  console.log(time() + ' <GLITCH> ' + response.sentence)
  previousResponseNodes = response.nodes
  res.send(response.sentence)
  save()
})


//--------- launch ---------//

app.listen(3000, function () {
  console.log(time() + ' <> GLITCH listening on port 3000.')
})