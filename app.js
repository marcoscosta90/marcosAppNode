//Carregando modulos
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const admin = require('./routes/admin')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash') //tipo de sessao q aparece uma vez, quando usuario recarrega a pagina ele some
require('./models/Postagem')
const Postagem = mongoose.model('postagens')
require('./models/Categoria')
const Categoria = mongoose.model('categorias')
const usuarios = require('./routes/usuario')
const passport = require('passport')
require('./config/auth')(passport)
const db = require('./config/db')



//Configuracoes
    //sessao
    app.use(session({   //criacao e configuracao de middleware
      secret: 'cursodenode',
      resave: true,
      saveUninitialized: true
    }))

    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())





    app.use(flash())

    //middleware
    app.use((req, res, next) => {
      res.locals.success_msg = req.flash('success_msg')
      res.locals.error_msg = req.flash('error_msg')
      res.locals.error = req.flash('error')
      res.locals.user = req.user || null;
      next()
    })



  //Body parser
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(bodyParser.json())

  //handlebars
  app.engine('handlebars', handlebars({defaultLayout: 'main'}))
  app.set('view engine', 'handlebars')

  //mongoose
  mongoose.Promise = global.Promise;
  mongoose.connect(db.mongoURI, {useNewUrlParser:true}).then(() =>  {
    console.log('Conectado ao mongo')
  }).catch((err) => {
    console.log('Erro ao se conectar'+err)
  })
    //em breve
//Public
//pasta que esta guardando todos os arquivos staticos e a pasta public
app.use(express.static(path.join(__dirname,'public')))

/* app.use((req, res, next) => {
  console.log('oi eu sou um middleware')
  next()
}) */

//Rotas
app.get('/postagem/:slug', (req, res) => {
  Postagem.findOne({slug: req.params.slug}).then((postagem) => {
    if(postagem){
      res.render('postagem/index', {postagem: postagem})
    }else {
      req.flash('error_msg', 'Essa postagem nao existe')
      res.redirect('/')
    }
  }).catch((err) => {
    req.flash('error_msg','Houve um erro interno')
    res.redirect('/')
  })
})


app.get('/', (req, res) => {
  Postagem.find().populate('categoria').sort({data: 'desc'}).then((postagens) => {
      res.render('index', {postagens: postagens})
  }).catch((err) => {
    req.flash('error_msg','Houve um erro interno')
    res.redirect('/404')
  })

})

app.get('/categorias', (req, res) => {
  Categoria.find().then((categorias) => {
    res.render('categorias/index', {categorias: categorias})
  }).catch((err) => {
    req.flash('error_msg','Houve um erro ao listar as categorias')
    res.redirect('/')
  })
})

app.get('/categorias/:slug', (req, res) => {
  Categoria.findOne({slug: req.params.slug}).then((categoria) => {
    if(categoria){
      Postagem.find({categoria: categoria._id}).then((postagens) =>{
        res.render('categorias/postagens', {postagens: postagens, categoria: categoria})
      }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar os posts')
        res.redirect('/')
      })
    }else {
      req.flash('error_msg','Essa categoria nao existe')
      res.redirect('/')
    }
  }).catch((err) => {
    req.flash('error_msg','Houve um erro ao carregar a pagina desta categoria')
    res.redirect('/')
  })
})


app.get('/404', (req, res) => {
  res.send('Erro 404')
})

app.get('/posts', (req, res) => {
  res.render('Lista Posts')
})

app.use('/admin', admin)
app.use('/usuarios', usuarios)

//Outros
const PORT= process.env.PORT || 8081
app.listen(PORT, () => {
  console.log('Servidor Rodando')
})
