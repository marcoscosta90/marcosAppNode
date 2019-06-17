const express = require('express')
const router = express.Router()
const mongoose = require('mongoose') //importa mongoose
require('../models/Categoria') //chama o arquivo do model
const Categoria = mongoose.model('categorias') //chama a funcao que passa uma referencia
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
const {eAdmin} = require('../helpers/eAdmin')




//rota principal painel adm
router.get('/', eAdmin, (req, res) =>{
res.render('admin/index')})

router.get('/posts', eAdmin, (req, res) => {
  res.send('Pagina de Posts')
})

router.get('/categorias', eAdmin, (req, res) => {
  Categoria.find().then((categorias) => {
    res.render('admin/categorias', {categorias: categorias})
  }).catch((err) => {
      req.flash('error_msg', 'houve um erro ao listar as categorias')
      res.redirect('/admin')
    })


})

router.get('/categorias/add', eAdmin, (req, res) => {
  res.render('admin/addcategorias')
})

router.post('/categorias/nova', eAdmin, (req, res) => {

//validacao de formularios
  var erros = []

  if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
    erros.push({texto: 'Nome Inválido'})
  }
  if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
    erros.push({texto: 'Slug Inválido'})
  }
  if(req.body.nome.length < 2){
    erros.push({texto: 'Nomes da categoria muito pequeno'})
  }

  if(erros.length > 0){
    res.render('admin/addcategorias', {erros: erros})
  }
  else {
    const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug
    }

    new Categoria(novaCategoria).save().then(() => {
      req.flash('success_msg', 'categoria criada com sucesso')
      res.redirect('/admin/categorias')
    }).catch((err) => {
      req.flash('error_msg', 'houve um erro ao salvar a categoria tente novamente')
      res.redirect ('/admin')
    })
  }
})

router.get('/categorias/edit/:id', eAdmin, (req, res) => { //essa rota serve na hora de buscar o registro e aparecer os dados no textbox


  Categoria.findOne({_id: req.params.id}).then((categoria) => {
      res.render('admin/editcategorias', {categoria: categoria})
  }).catch((err) => {
    req.flash('error_msg', 'essa categoria nao existe')
    res.redirect('/admin/categorias')
  })
  })

 router.post('/categorias/edit', eAdmin, (req, res) => {

   Categoria.findOne({_id: req.body.id}).then((categoria) => {

     categoria.nome = req.body.nome
     categoria.slug = req.body.slug

     categoria.save().then(() => {
  req.flash('success_msg', 'Categoria editada com sucesso'),
  res.redirect('/admin/categorias')
}).catch((err) => {
  req.flash('error_msg', 'houve um erro interno ao salvar a categoria')
  res.redirect('/admin/categorias')
})

}).catch((err) => {
     req.flash('error_msg', 'houve um erro ao editar a categoria')
     res.redirect('/admin/categorias')
   })
})

router.post('/categorias/deletar', eAdmin, (req, res) => {
  Categoria.remove({_id: req.body.id}).then(() => {
    req.flash('success_message', 'Categoria deletada com sucesso')
    res.redirect('/admin/categorias')
  }).catch((err) => {
    req.flash('error_msg', 'houve um erro ao deletar a categoria')
    res.redirect('/admin/categorias')
  })
})

router.get('/postagens', eAdmin, (req, res) => {
  Postagem.find().populate('categoria').sort({data:'desc'}).then((postagens) =>{
    res.render('admin/postagens', {postagens: postagens})
  }).catch((err) => {
    req.flash('error_msg', 'houve um erro ao listas as postagens')
    res.redirect('/admin')
})
})


router.get('/postagens/add',eAdmin, (req, res) => {
    Categoria.find().then((categorias) => {
      res.render('admin/addpostagem', {categorias: categorias})
    }).catch((err) => {
      req.flash('error_msg', 'houve um erro ao carregar o formulario')
      res.redirect('/admin')
    })

})

router.post('/postagens/nova', eAdmin, (req, res) => {
  var erros = []

  if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
    erros.push({texto: 'Titulo Inválido'})
  }
  if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
    erros.push({texto: 'Slug Inválido'})
  }
  if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
    erros.push({texto: 'Descricao Inválida'})
  }
  if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
    erros.push({texto: 'Conteudo Inválido'})
  }
  if(req.body.categoria == 0){
    erros.push({texto: 'Categoria invalida, registre uma categoria'})
  }
  if(erros.length > 0){
    res.render('admin/addpostagem', {erros: erros})
  } else {
    const novaPostagem = {
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria,
      slug: req.body.slug
    }
    new Postagem(novaPostagem).save().then(() => {
      req.flash('success_msg', 'Postagem Criada com sucesso')
      res.redirect('/admin/postagens')
    }).catch((err) => {
      req.flash('error_msg', 'Houve um erro durante ao salvamento da postagem')
      res.redirect('/admin/postagens')
    })
  }
})

router.get('/postagens/edit/:id', eAdmin, (req, res) => {
  Postagem.findOne({_id: req.params.id}).then((postagem) => {

    Categoria.find().then((categorias) => {
      res.render('admin/editpostagens', {categorias: categorias, postagem: postagem})
    }).catch((err) => {
      req.flash('error_msg', 'Houve um erro ao listar as categorias')
      res.redirect('/admin/postagens')
    })

  }).catch((err) => {
    req.flash('error_msg', 'Houve um erro ao  carregar o formulario')
    res.redirect('/admin/postagens')
  })

})

router.post('/postagem/edit', eAdmin, (req, res) => {
  Postagem.findOne({_id: req.body.id}).then((postagem) => {
    postagem.titulo = req.body.titulo
    postagem.slug = req.body.slug
    postagem.descricao = req.body.descricao
    postagem.conteudo = req.body.conteudo
    postagem.categoria = req.body.categoria

    postagem.save().then(() => {
      req.flash('success_msg','Postagem editada com sucesso')
      res.redirect('/admin/postagens')
    }).catch((err) => {
      req.flash('error_msg','Erro Intero')
      res.redirect('/admin/postagens')
    })
  }).catch((err) => {
    req.flash('error_msg','Houve um erro ao salvar a edicao')
    res.redirect('/admin/postagens')
  })
})

router.get('/postagens/deletar/:id', eAdmin, (req, res) => {
  Postagem.remove({_id: req.params.id}).then(() => {
    req.flash('success_msg', 'Postagem deletada com sucesso')
    res.redirect('/admin/postagens')
  }).catch((err) => {
    req.flash('error_msg','Houve um erro ao deletar a postagem')
    req.redirect('/admin/postagens')
  })
})


//exportar o modulo
module.exports = router
