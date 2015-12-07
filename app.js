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
        res.locals.deleteIcon = "fa fa-trash fa-1x";
        res.locals.editIcon = "fa fa-pencil fa-1x";
        res.locals.saveIcon = "fa fa-floppy-o fa-2x";
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

app.post('/update', function(req, res, next) {
    pool.query("SELECT * FROM workouts WHERE id=(?)", [req.body.id], function(err, results) {
        if(err) {
            next(err);
            return;
        }   
        if(results.length == 1) {
            var curVals = results[0];
            pool.query("UPDATE workouts SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=? ",
                [req.body.name || curVals.name, 
                req.body.reps || curVals.reps,
                req.body.weight || curVals.weight,
                req.body.date || curVals.date,
                req.body.lbs || curVals.lbs,
                req.body.id],
                function(err, iresult) {
                    if(err) {
                        console.log("error2");
                        next(err);
                        return;
                    }
                    pool.query('SELECT *, DATE_FORMAT(date, "%Y-%m-%d") AS date FROM workouts WHERE id=(?)', 
                        [req.body.id],
                        function(err,row,fields) {
                            if(err) {
                                console.log(err);
                                next(err);
                                return;
                            }
                        console.log(row[0]);
                        res.send(row[0]);
                    });
                });
        }
        else {
            console.log("No results found... is id missing?");
        }
    });
});

app.post('/delete', function(req, res, next) {
    pool.query("DELETE FROM workouts WHERE id=?", [req.body.id], function(err, result) {
        if(err) {
            next(err);
            return;
        }
        res.locals.deleted = result;
        res.send(req.body);
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

