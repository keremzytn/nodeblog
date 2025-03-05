const express = require('express')
const router = express.Router()
const Post = require('../models/Post')
const Category = require('../models/Category')
const User = require('../models/User')

router.get('/', (req, res) => {
    console.log(req.session)
    res.render('site/index')
})

/* router.get('/admin', (req, res) => {
    res.render('admin/index')
}) */

router.get('/blog', (req, res) => {
        Promise.all([
            Category.find({}).sort({ $natural: -1 }),
            Post.find({}).populate({path:'author', model: User}).sort({ $natural: -1 })
        ])
        .then(([categories, posts]) => {
            res.render('site/blog', { categories: categories, posts: posts });
        })
        .catch(error => {
            console.error("Veri çekme hatası:", error);
            res.status(500).send("Bir hata oluştu.");
        });
});

router.get('/contact', (req, res) => {
    res.render('site/contact')
})

module.exports = router