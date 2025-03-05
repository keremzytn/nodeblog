const express = require('express')
const router = express.Router()
const Post = require('../models/Post')
const path = require('path')
const Category = require('../models/Category')
const User = require('../models/User')


router.get('/new', (req, res) => {
    if(!req.session.userId){
        res.redirect('/users/login')
    }

    Category.find({}).then(categories =>{
        res.render('site/addpost', {categories: categories})
    })
})

/* router.get('/:id', (req, res) => {
    Post.findById(req.params.id).populate({path:'author', model: User}).then(post=>{
        res.render('site/post', {post:post})
    })
}) */

router.get('/:id', (req, res) => {
        Promise.all([
            Category.find({}).sort({ $natural: -1 }),
            Post.findById(req.params.id).populate({path:'author', model: User}).sort({ $natural: -1 })
        ])
        .then(([categories, post]) => {
            res.render('site/post', { categories: categories, post: post });
        })
        .catch(error => {
            console.error("Veri çekme hatası:", error);
            res.status(500).send("Bir hata oluştu.");
        });
});

router.post('/test', (req, res) => {

    let post_image = req.files.post_image

    post_image.mv(path.resolve(__dirname, '../public/img/postimages', post_image.name))

    Post.create({
        ...req.body,
        post_image: `/img/postimages/${post_image.name}`,
        author: req.session.userId
    },)

    req.session.sessionFlash = {
        type: 'alert alert-success',
        message: 'Postunuz başarılı bir şekilde oluşturuldu.'
    }
    res.redirect('/blog')
})

module.exports = router