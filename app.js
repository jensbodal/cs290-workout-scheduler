var express = require('express');
var config = require('./config');
var path = require('path');
var mysql = require('mysql');

var pool = config.mysql.pool;

// Using jade
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));



app.set('port', process.env.PORT || 9000);

function selectTable(query, callback) {
    var tableData;
    pool.query('SELECT ' + query + ' FROM todo', function(err,rows,fields) {
        if(err) {
            console.log(err);
            next(err);
            return;
        }
        return (callback(rows));
    });
}

app.get('/', function(req, res) {
    selectTable("*", function(tableData) {
        res.locals.sqlTable = tableData;
        console.log("Testing worked");
        res.render('home', {title: 'Table Stuff'});
    });
});

app.get('/reset-table', function(req, res, next) {
    pool.query("DROP TABLE IF EXISTS todo", function(err) {
        var createString = "CREATE TABLE todo(" +
        "id INT PRIMARY KEY AUTO_INCREMENT," +
        "name VARCHAR(255) NOT NULL," +
        "done BOOLEAN," +
        "due DATE)";
        
        pool.query(createString, function(err) {
            res.locals.generic = "Table reset";
            res.render('home', {title: 'Table Reset'});
        })

    });
});

app.get('/insert', function(req, res, next) {
    pool.query("INSERT INTO todo (`name`) VALUES (?)", [req.query.c], function(err, result) {
        if(err) {
            next(err);
            return;
        }
        res.locals.inserted = "Inserted id " + result.insertId;
        res.render('home');
    });
});

app.get('/insertDate', function(req, res, next) {
    pool.query("INSERT INTO todo (`due`) VALUES (?)", [req.query.c], function(err, result) {
        if(err) {
            next(err);
            return;
        }
        res.locals.inserted = "Inserted id " + result.insertId;
        res.render('home');
    });
});

app.get('/update', function(req, res, next) {
    pool.query("SELECT * FROM todo WHERE id=?", [req.query.id], function(err, result) {
        if(err) {
            next(err);
            return;
        }   
        if(result.length == 1) {
            var curVals = result[0];
            pool.query("UPDATE todo SET name=?, done=?, due=? WHERE id=? ",
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
    pool.query("DELETE FROM todo WHERE id=?", [req.query.id], function(err, result) {
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

