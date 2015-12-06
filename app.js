var express = require('express');
var config = require('./config');
var path = require('path');
var mysql = require('mysql');
var bodyParser = require('body-parser');

var pool = config.mysql.pool;

// Using jade
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: false}));


app.set('port', process.env.PORT || 9000);

function selectTable(query, callback) {
    var tableData;
    pool.query('SELECT *, DATE_FORMAT(date, "%Y-%m-%d") AS date FROM workouts', function(err,rows,fields) {
        if(err) {
            console.log(err);
            next(err);
            return;
        }
        return (callback(rows));
    });
}

function getContext(type, req, isPost) {
    var params = [];
    if (isPost) {
        reqType = req.body;
    }
    else {
        reqType = req.query;
    }
    for (var param in reqType) {
        params.push({'name':param, 'value':reqType[param]});
    }
    var context = {};
    context.params = params;
    context.type = type;
    return context;
}

app.get('/', function(req, res) {
    selectTable("*", function(tableData) {
        res.locals.sqlTable = tableData;
        res.render('home', {title: 'Table Stuff'});
    });
});

app.get('/reset-table', function(req, res, next) {
    pool.query("DROP TABLE IF EXISTS workouts", function(err) {
        var createString = "CREATE TABLE workouts(" +
        "id INT PRIMARY KEY AUTO_INCREMENT," +
        "name VARCHAR(255) NOT NULL," +
        "reps INT," +
        "weight INT," +
        "date DATE, " +
        "lbs BOOLEAN)";
        
        pool.query(createString, function(err) {
            res.locals.generic = "Table reset";
            res.render('home', {title: 'Table Reset'});
        })

    });
});

app.post('/insert', function(req, res) {
    console.log(req.body.lbs);
    if (req.body.lbs === "true") {
        req.body.lbs = 1;
    }
    else {
        req.body.lbs = 0;
    }
    pool.query("INSERT INTO workouts SET ?",
        req.body,
        function(err, results) {
            if (err) {
                next(err);
                return;
        }
        req.body.id = results.insertId;
        res.send(req.body);
    });
});

app.get('/update', function(req, res, next) {
    pool.query("SELECT * FROM workouts WHERE id=?", [req.query.id], function(err, result) {
        if(err) {
            next(err);
            return;
        }   
        if(result.length == 1) {
            var curVals = result[0];
            pool.query("UPDATE workouts SET name=?, done=?, due=? WHERE id=? ",
                [req.query.name || curVals.name, 
                req.query.done || curVals.done,
                req.query.due || curVals.due, 
                req.query.id],
                function(err, result) {
                    if(err) {
                        next(err);
                        return;
                    }
                    res.locals.notice = req.query.id;
                    selectTable("*", function(tableData) {
                        res.locals.sqlTable = tableData;
                        res.render('home');
                    });
                });
        }
    });
    console.log("Update finished?");
});

app.get('/delete', function(req, res, next) {
    pool.query("DELETE FROM workouts WHERE id=?", [req.query.id], function(err, result) {
        if(err) {
            next(err);
            return;
        }
        res.locals.deleted = result;
        res.render('home');
    });
});

app.use(function(req, res, next){
        res.type('text/plain');
        res.status(404);
        res.send('404 - There is nothing here save for vast expanses of nothing');
});

app.listen(app.get('port'), function(){
        console.log( 'Express started on http://localhost:' + app.get('port') +' press Ctrl-C to exit' );
});

