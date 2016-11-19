module.exports = function(app, passport, connection, transporter, dbconfig, title, bcrypt, isLoggedIn) {

    app.post('/modulo', isLoggedIn, function(req, res) {

        if (req.user.Profesor == 0) {
            res.redirect('/');
        }

        var informacion = req.body.contenido;
        var tipo = req.body.tipo;
        var unidad= req.body.laUnidad;

        connection.query('INSERT INTO modulo (Tipo, Informacion, Unidad_idUnidad) VALUES (?, ?, ?)',[tipo,informacion,unidad] ,function (err, rows) {
            if (err) throw err;

            console.log('holaza');
        });
        res.redirect('/crearModulos');

    });

    app.get('/crearModulos', isLoggedIn, function(req, res) {

        if (req.user.Profesor == 0) {
            res.redirect('/');
        }
        connection.query('SELECT * FROM unidad', function(err, rows, fields) {
            if (err) throw err;

            res.render("crearModulos.ejs", {
                title: title,
                user: req.user,
                unidadsos: rows
            });
        });
    });

}