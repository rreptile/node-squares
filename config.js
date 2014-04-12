module.exports = function(app, express){
    var config = this;

    app.configure(function(){
        app.use(express.static(__dirname + '/public'));
        app.use('/bower_components',  express.static(__dirname + '/bower_components'));
    });

    return config;

};