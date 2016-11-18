module.exports = function(app, passport, connection, transporter,dbconfig,title,bcrypt,isLoggedIn) {

  //requires
  require('./unidades.js')(app, passport, connection, transporter,dbconfig,title,bcrypt,isLoggedIn);

  // =====================================
  // RAMOS ===============================
  // =====================================

  app.get('/ramos', isLoggedIn, function(req, res) {
    connection.query('SELECT * FROM ramo', function(err, rows, fields) {
      if (err) throw err;
      //console.log('RAMO '+ rows[0].Nombre);
      res.render('ramos/ramos.ejs', {
          title: title,
          user: req.user,
          rows:rows
      });
    });
  });

  app.post('/ramos/u',isLoggedIn,function(req,res){

    req.session.idRamo = req.body.ramo_id;
    res.redirect("/ramos/u");

  });

  app.post('/ramos/u/materia',isLoggedIn,function(req,res){

      res.redirect("/");

  });

}