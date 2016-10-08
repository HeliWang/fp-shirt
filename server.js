(function() {
    var http = require('http');
    var express = require('express');
    var app = require('express')();
    var request = require('request');
    var bodyParser = require('body-parser');
    var querystring = require('querystring');
    var datejs = require("datejs");
    var fs = require('fs');
    var os = require('os');
    var multer  =   require('multer');
    
    var storage =   multer.diskStorage({
      destination: function (req, file, callback) {
        callback(null, './uploads');
      },
      filename: function (req, file, callback) {
        callback(null, file.originalname);
      }
    });
    var upload = multer({ storage : storage});


    // Create application/x-www-form-urlencoded parser
    var urlencodedParser = bodyParser.urlencoded({extended: false});
    var urlencodedParserExtended = bodyParser.urlencoded({extended: true});
    var jsonParser = bodyParser.json();

    var server = http.Server(app);

    var port = process.env.PORT;
    var hostname = process.env.IP;

    var isStrJson = function isStrJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    };

    console.log('Initiating server on port ' + port);
    server.listen(port);
    console.log('Server up and running!');

    function printObject(obj) {
        for ( var key in obj ) {
            if ( typeof obj[key] === "Object" ) {
                console.log(key + " = object");
                printObject(obj[key]);
            } else {
                console.log(key + " = " + obj[key]);
            }
        }
    }

    /*
     * HTTP Endpoints
     */
    app.disable('etag');

    app.post('/upload', upload.single('file'));
    
    app.use(express.static(__dirname + '/', {
      hidden: true,
      maxAge: 31557600000
    }));

})();