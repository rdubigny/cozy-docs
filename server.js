var http = require('http'),
    express = require('express'),
    app = express(),
    sqlite3 = require('sqlite3').verbose(),
    bodyParser = require('body-parser'),
    db = new sqlite3.Database('cozy');

/* We add configure directive to tell express to use Jade to
   render templates */
app.set('views', __dirname + '/public');
app.engine('.html', require('jade').__express);

// Allows express to get data from POST requests
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Database initialization
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='docs'", function(err, row) {
    if(err !== null) {
        console.log(err);
    }
    else if(row == null) {
        db.run('CREATE TABLE "docs" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "title" VARCHAR(255), "content" TEXT)', function(err) {
            if(err !== null) {
                console.log(err);
            }
            else {
                console.log("SQL Table 'docs' initialized.");
            }
        });
    }
    else {
        console.log("SQL Table 'docs' already initialized.");
    }
});

// We render the templates with the data
app.get('/', function(req, res) {

    db.all('SELECT * FROM docs ORDER BY title', function(err, row) {
        if(err !== null) {
            res.status(500).send("An error has occurred -- " + err);
        }
        else {
            res.render('index.jade', {docs: row}, function(err, html) {
                res.status(200).send(html);
            });
        }
    });
});

// We render the templates with the data
app.get('/d/:id/edit', function(req, res) {
    db.all("SELECT * FROM docs WHERE id='" + req.params.id + "'", function(err, row) {
        if(err !== null) {
            res.status(500).send("An error has occurred -- " + err);
        }
        else {
            res.render('edit.jade', {doc: row}, function(err, html) {
                res.status(200).send(html);
            });
        }
    });
});

// We define a new route that will handle doc creation
app.post('/add', function(req, res) {
    title = req.body.title;
    sqlRequest = "INSERT INTO 'docs' (title) VALUES('" + title + "')"
    db.run(sqlRequest, function(err) {
        if(err !== null) {
            res.status(500).send("An error has occurred -- " + err);
        }
        else {
            res.redirect('back');
        }
    });
});

// We define a new route that will handle doc creation
app.post('/d/:id/save', function(req, res) {
    sqlRequest = "UPDATE 'docs' SET content='" + req.body.content + "' WHERE id='" + req.params.id + "'"
    db.run(sqlRequest, function(err) {
        if(err !== null) {
            res.status(500).send("An error has occurred -- " + err);
        }
        else {
            res.redirect('back');
        }
    });
});

// We define another route that will handle doc deletion
app.get('/delete/:id', function(req, res) {
    db.run("DELETE FROM docs WHERE id='" + req.params.id + "'", function(err) {
        if(err !== null) {
            res.status(500).send("An error has occurred -- " + err);
        }
        else {
            res.redirect('back');
        }
    });
});

/* This will allow Cozy to run your app smoothly but
 it won't break other execution environment */
var port = process.env.PORT || 9250;
var host = process.env.HOST || "127.0.0.1";

// Starts the server itself
var server = http.createServer(app).listen(port, host, function() {
    console.log("Server listening to %s:%d within %s environment",
                host, port, app.get('env'));
});
