var httpwebsite = require('http');
var backend = require ('./backend');
var newBackend = require ('./newBackend');

httpwebsite.createServer(newBackend.processRequest).listen(8000);
