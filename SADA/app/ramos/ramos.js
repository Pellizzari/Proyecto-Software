module.exports = function(app, passport, connection, transporter, dbconfig, title, bcrypt, isLoggedIn) {

  // =====================================
  // RAMOS ===============================
  // =====================================

  app.get('/ramos', isLoggedIn, function(req, res) {
    connection.query('SELECT * FROM ramo', function(err, rows, fields) {
      if (err) throw err;
      res.render('ramos/ramos.ejs', {
          title: title,
          user: req.user,
          rows:rows
      });
    });
  });

  app.post('/ramos/u',isLoggedIn,function(req,res){

    req.session.idRamo = req.body.ramo_id;
    req.session.nombreRamo = req.body.ramo_nombre;
    req.session.siglaRamo=req.body.ramo_sigla;
    res.redirect("/ramos/u");

  });

  app.get('/ramos/u', isLoggedIn, function(req, res) {
    connection.query('SELECT * FROM unidad WHERE Ramo_idRamo = ? ',req.session.idRamo, function(err, rows, fields) {
      if (err) throw err;
      console.log(req.session.nombreRamo);
      res.render("ramos/unidades.ejs",{
        title:title,
        user:req.user,
        unidades:rows,
        ramo_sigla:req.session.siglaRamo,
        ramo_nombre:req.session.nombreRamo
      });

    });//end query
  });

  app.post('/ramos/u/materia',isLoggedIn,function(req,res){
          req.session.idUnidad = req.body.idUnidad;
          req.session.nombreUnidad = req.body.nombreUnidad;
          res.redirect("/ramos/u/materia");
  });

  app.get('/ramos/u/materia',isLoggedIn,function(req,res){
    var perfilAux;

    if(req.user.Profesor==1){
      perfilAux = req.session.perfilTemp;
    }
    else{
      perfilAux = req.user.perfil_idperfil;
    }

    connection.query('SELECT * FROM plantilla WHERE Activo = 1 AND  perfil_idperfil = ? AND Unidad_idUnidad = ?',[perfilAux,req.session.idUnidad], function(err, plantilla) {
      if(err) throw err;
      if(plantilla.length==0){
        res.render("ramos/plantilla.ejs",{
          title:title,
          user:req.user,
          nombreUnidad:req.session.nombreUnidad,
          ok:0,
          ramo_sigla:req.session.siglaRamo,
          ramo_nombre:req.session.nombreRamo
        });
      }
      else{
        connection.query('SELECT * FROM ensamblaje INNER JOIN modulo ON ensamblaje.Modulo_idModulo=modulo.idModulo WHERE Plantilla_idPlantilla=? ORDER BY columna ASC, posicion ASC',[plantilla[0].idPlantilla], function(err, modulos) {
            connection.query('SELECT * FROM valoracion WHERE Plantilla_idPlantilla=? AND usuario_Rut=?',[plantilla[0].idPlantilla,req.user.Rut],function(err, valor) {
                if (err) throw err;
                res.render("ramos/plantilla.ejs",{
                  title:title,
                  user:req.user,
                  plantilla:plantilla[0],
                  modulos:modulos,
                  nombreUnidad:req.session.nombreUnidad,
                  nombreRamo:req.session.nombreRamo,
                  ok:1,
                  valor:valor,
                  ramo_sigla:req.session.siglaRamo,
                  ramo_nombre:req.session.nombreRamo
                });
            });
        });
      }
    });//end query

  });


  app.post('/valorar',isLoggedIn,function(req,res){
      var plantilla=parseInt(req.body.idPlantilla), estrellas=parseInt(req.body.estrellas);
      connection.query('UPDATE plantilla SET valoracion=((valoracion*conteo)+?)/(conteo+1),conteo=conteo+1 WHERE idPlantilla=?',[estrellas,plantilla], function(err, rows) {
          connection.query('INSERT INTO valoracion VALUES (?,?)',[plantilla,req.user.Rut], function(err, rows) {
            res.redirect("/ramos/u/materia");
          });
      });

  });

  app.post('/proponerPlantilla',isLoggedIn,function(req,res){
        console.log(req.body.idPlantilla);
        connection.query('SELECT * FROM modulo WHERE idModulo IN (SELECT Modulo_idModulo FROM ensamblaje WHERE Plantilla_idPlantilla=?)',[req.body.idPlantilla], function(err, rows) {
          res.render("ramos/proponerPlantilla.ejs", {
              title: title,
              user: req.user,
              modulasos: rows,
              nombreUnidad:req.session.nombreUnidad,
              idUnidad:req.session.idUnidad
          });
        });
  });

  app.post('/enviarProposicion',isLoggedIn,function(req,res){
    var col1 = req.body.sort1.split(",");
    var col2 = req.body.sort2.split(",");
    var col3 = req.body.sort3.split(",");

    var noentrar = false;

    var exito = 1;
    var mensaje = "La pagina fue propuesta con éxito."

    //Ve si ya existe una plantilla con el mismo nombre
    connection.query('SELECT * FROM plantilla WHERE Nombre = ? AND Unidad_idUnidad = ?',[req.body.plantillaSave,req.body.unidad_id],function(err, filas, fields){
      if(err) throw err;
      if(filas.length>0){
        noentrar=true;
        exito=0;
        mensaje = "Ya propusiste una página para esta unidad."
      };

      //Agrega plantilla
      if(!noentrar){
        connection.query('INSERT INTO plantilla (Nombre, perfil_idperfil, Unidad_idUnidad,Propuesta) VALUES (?, ?, ?, 1) ',[req.body.plantillaSave, req.body.perfil, req.body.unidad_id],function(err, rows, fields){
          if(err) throw err;
        });

        //Busca id plantilla agregada para luego agregar a ensamblaje
        connection.query('SELECT * FROM plantilla WHERE Nombre = ? AND Unidad_idUnidad = ?',[req.body.plantillaSave,req.body.unidad_id],function(err, rows, fields){
          if(err) throw err;
          if(col1!=''){
            for(var i = 0;i<col1.length;i++){
              connection.query('INSERT INTO ensamblaje VALUES (?,?,?,?)',[rows[0].idPlantilla,col1[i],1,i],function(err1, rows1, fields1){
                if(err1) throw err1;
              });
            }
          }
          if(col2!=''){
            for(var i = 0;i<col2.length;i++){
              connection.query('INSERT INTO ensamblaje VALUES (?,?,?,?)',[rows[0].idPlantilla,col2[i],2,i],function(err1, rows1, fields1){
                if(err1) throw err1;
              });
            }
          }
          if(col3!=''){
            for(var i = 0;i<col3.length;i++){
              connection.query('INSERT INTO ensamblaje VALUES (?,?,?,?)',[rows[0].idPlantilla,col3[i],3,i],function(err1, rows1, fields1){
                if(err1) throw err1;
              });
            }
          }
        });
      }
      res.render('ramos/exito.ejs',{
        title: title,
        user: req.user,
        mensaje: mensaje,
        exito: exito
      });
    });//end query grande

  });

}
