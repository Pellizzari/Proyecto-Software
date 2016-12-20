module.exports = function(app, passport, connection, transporter,dbconfig,title,bcrypt) {

  app.post('/prueba', function(req, res) {
    if (req.body.nombre != 0){
        res.render("index/prueba.ejs",{
            title: title,
            nombre: req.body.nombre
        });
    }
  });

}
