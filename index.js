/*------ require ------**
Express: $ npm install express --save
Ector: $ npm install ector
Merge: npm install merge --save
**---------------------*/

var express = require('express')
var app = express()
var Ector = require('ector')
const ector = new Ector("GLITCH", "User")
const fs = require('fs')
var merge = require('merge')

//-------- lib --------//

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
  fs.writeFile('concept.cn', JSON.stringify(ector.cn))
}

function load(){
  var loadcn, loadcns
  loadcn = JSON.parse(fs.readFileSync('concept.cn', 'utf8'))
  ector.cns = {}
  ector.cn = merge(ector.cn, loadcn)
  ector.setUser("User")
  console.log(time() + ' <> ' + 'GLITCH concept network online.')  
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