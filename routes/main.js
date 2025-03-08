const express = require('express')
const router = express.Router()
const Post = require('../models/Post')
const Category = require('../models/Category')
const User = require('../models/User')

router.get('/', (req, res) => {
    console.log(req.session)
    res.render('site/index')
})

router.get('/blog', (req, res) => {
    Promise.all([
        Category.find({}).sort({ $natural: -1 }),
        Post.find({}).populate({ path: 'author', model: User }).sort({ $natural: -1 }),
        Category.aggregate([
            {
                $lookup: {
                    from: 'posts',
                    localField: '_id',
                    foreignField: 'category',
                    as: 'posts'
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    num_of_posts: { $size: '$posts' }
                }
            },
            {
                $sort: { _id: -1 }
            }
        ])
    ])
    .then(([categories, allPosts, categoryAggregated]) => {
        res.render('site/blog', { 
            categories: categories, 
            posts: allPosts,      // Ana sayfadaki blog listesi için
            allPosts: allPosts,   // Sidebar için
            categoryAggregated: categoryAggregated 
        });
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