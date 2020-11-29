const nanoid = require('nanoid')
const router = require('./router');
module.exports = function(app, db) {
    router(app, db);
};
var ObjectID = require('mongodb').ObjectID;
module.exports = function(app, database) {

    const db = database.db('Cluster0')
    app.post('/shorten', (req, res) => {
        const oldUrl = req.body.urlToShorten;
        const shortenedUrl = nanoid.nanoid(8)
        const urlBinding = { oldUrl: oldUrl, shortenedUrl: shortenedUrl, count:0 };
        const response = {status:"Created",shortenedUrl:"http://localhost:8000/"+shortenedUrl}
        db.collection('urlBindings').insert(urlBinding, (err, result) => {
            if (err) {
                res.send({ 'error': 'An error has occurred' });
            } else {
                res.send(response,201);
            }
        });
    });
    app.get ('/:url', (req, res) => {
        const shortenedUrl = req.params.url;
        const query ={shortenedUrl:shortenedUrl}
        db.collection('urlBindings').findOne(query, (err, item) => {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                let countNew = item.count+1
                let queryUpdate = {shortenedUrl:shortenedUrl}
                let newValues = { $set: {count: countNew } };
                db.collection('urlBindings').updateOne(queryUpdate, newValues, function(err, res) {
                    if (err) throw err;

                });
                let redirectUrl = 'http://'+item.oldUrl
                let response={redirectTo:redirectUrl}
                res.header('location',redirectUrl)
                res.send(response,301)
            }

        });
    });
    app.get('/:url/views', (req, res) => {
        const shortenedUrl = req.params.url;
        const query ={shortenedUrl:shortenedUrl}
        db.collection('urlBindings').findOne(query, (err, item) => {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                let response = {viewCount: item.count}
                res.send(response,200)
            }
        });
    });

};
