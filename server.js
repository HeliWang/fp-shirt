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
    var multer = require('multer');

    /* Image Upload */
    var storage = multer.diskStorage({
        destination: function(req, file, callback) {
            callback(null, './uploads');
        },
        filename: function(req, file, callback) {
            callback(null, file.originalname);
        }
    });
    var upload = multer({
        storage: storage
    });

    var port = process.env.PORT;
    var hostname = process.env.IP;
    var c9_username = process.env.C9_USER;

    console.log(hostname + ":" + port + " " + c9_username);

    /* Remote MySQL Connection */
    /* Note: This is the C9.io server specified Environment Settings */
    var mysql    = require('mysql');
    var connection = mysql.createConnection({ 
        host  : hostname,
         user  : c9_username,
         password: '',
         database: 'c9',
         port: 3306
    });

    console.log("connecting to C9 MySQL DB...");
    connection.connect(function(err, results) {
        if (err) {
            console.log("ERROR: " + err.message);
            throw err;
        }
        console.log("connected.");

        connection.query('CREATE TABLE IF NOT EXISTS Project (' +
            ' Project_id int NOT NULL AUTO_INCREMENT,' +
            ' Project_name VARCHAR(100) NOT NULL,' +
            ' Project_content VARCHAR(5000),' +
            ' PRIMARY KEY(Project_id))',
            function(err, result) {
                if (err) {
                    console.log(err);
                } else {}
            });

    });

    // Create application/x-www-form-urlencoded parser
    var urlencodedParser = bodyParser.urlencoded({
        extended: false
    });
    var urlencodedParserExtended = bodyParser.urlencoded({
        extended: true
    });
    var jsonParser = bodyParser.json();

    var server = http.Server(app);

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
        for (var key in obj) {
            if (typeof obj[key] === "Object") {
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

    app.get("/projectList", function(req, res) {
        connection.query('SELECT * from Project', function(err, rows, fields) {
            // connection.end();
             
            if (!err) {  
                res.json(rows);  
                res.end(); 
            } 
            else   console.log('Error while performing Query.'); 
        });
    });

    app.use(bodyParser.urlencoded());
    app.use(bodyParser.json());

    app.post("/insertProject", function(req, res) {

        var returnProjectID = function() {
            connection.query('SELECT Project_id from Project where Project_name = "' + req.body.name + '"', function(err, rows, fields) { 
                if (!err) {  
                    res.send(rows[0]);  
                    res.end(); 
                } else console.log(err);
            })
        };

        if (req.body.projectid == null || req.body.projectid == "null") {
            connection.query('insert into Project (Project_name, Project_content) ' +
                'values (?,?)', [req.body.name, req.body.content],
                function(err, rows, fields) { 
                    if (!err) {  // return new project ID
                         
                        returnProjectID(); 
                    } 
                    else  console.log(err);
                });
        } else {
            connection.query('UPDATE Project SET Project_name="' + req.body.name + '"' + ', Project_content=' + JSON.stringify(req.body.content) + ' WHERE Project_id=' +
                req.body.projectid,
                function(err, rows, fields) { 
                    if (!err) returnProjectID(); 
                    else console.log(err);
                });
        }
    });

    app.use(express.static(__dirname + '/', {
        hidden: true,
        maxAge: 31557600000
    }));

})();