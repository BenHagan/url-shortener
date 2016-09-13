var express = require('express');
var mongodb = require('mongodb');
var path = require('path');
var randomstring = require('randomstring');

var MongoClient = mongodb.MongoClient;
var url = process.env.MONGO;
var hostname = process.env.HOST;

MongoClient.connect(url, function(err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', error);
  } else {
    console.log('Connection established to', url);
  }

  var collection = db.collection('urls');
  var app = express();

  app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  app.get('/:id', function(req, res) {
    collection.find({url: req.params.id}, function(err, cursor) {
      cursor.count().then(function(result) {
        if (result == 0) {
          res.send({error: 'Invalid URL'});
        } else {
          cursor.toArray(function(err, items) {
            res.redirect(items[0].href);
          });
        }
      });
    });
  });

  app.get('/new/:id*', function(req, res) {
    var re = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    var website = req.params.id + req.params[0];

    if (re.test(website)) {
      doc = {
              href: website,
              url: randomstring.generate({length: 5, charset: 'alphabetic'}).toLowerCase()
            };
      collection.insert(doc, function(err, data) {
        if (err) {
          console.log('Mongo error:', err);
        } else {
          res.send({
                    original_url: website,
                    short_url: hostname + doc.url
                  });
        }
      });
    } else {
      res.send({error: "URL invalid"});
    }

  });

  app.listen(process.env.PORT);

});
