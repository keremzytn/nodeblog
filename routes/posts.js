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

router.get('/search', (req, res) => {
    if (req.query.look) {
        const regex = new RegExp(escapeRegex(req.query.look), 'gi');
        Post.find({ "title": regex }).populate({ path: 'author', model: User }).sort({ $natural: -1 }).then(posts => {
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
            ]).then(categoryAggregated => { // categories yerine categoryAggregated kullanıldı
                Post.find({}).populate({ path: 'author', model: User }).sort({ $natural: -1 }).then(allPosts => { // allPosts oluşturuldu
                    res.render('site/blog', { categories: categoryAggregated, posts: posts, categoryAggregated: categoryAggregated, allPosts: allPosts }); // categoryAggregated ve allPosts gönderiliyor
                });
            });
        });
    } else {
        Post.find({}).populate({ path: 'author', model: User }).sort({ $natural: -1 }).then(posts => {
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
            ]).then(categoryAggregated => {
                Post.find({}).populate({ path: 'author', model: User }).sort({ $natural: -1 }).then(allPosts => {
                    res.render('site/blog', { categories: categoryAggregated, posts: posts, categoryAggregated: categoryAggregated, allPosts: allPosts });
                });
            });
        });
    }
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

router.get('/category/:categoryId', (req, res) => {
    Promise.all([
        Category.find({}).sort({ $natural: -1 }),
        Post.find({category: req.params.categoryId})
            .populate({ path: 'author', model: User })
            .populate({ path: 'category', model: Category })
            .sort({ $natural: -1 }),
        Post.find({})
            .populate({ path: 'author', model: User })
            .sort({ $natural: -1 }),
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
    .then(([categories, categoryPosts, allPosts, categoryAggregated]) => {
        res.render('site/blog', {
            categories: categories,
            posts: categoryPosts,
            allPosts: allPosts,
            categoryAggregated: categoryAggregated
        });
    })
    .catch(error => {
        console.error("Veri çekme hatası:", error);
        res.status(500).send("Bir hata oluştu.");
    });
})

router.get('/:id', (req, res) => {
    Promise.all([
        Category.find({}).sort({ $natural: -1 }),
        Post.findById(req.params.id).populate({ path: 'author', model: User }).sort({ $natural: -1 }),
        Post.find({}).populate({ path: 'author', model: User }).sort({ $natural: -1 }), // posts -> allPosts
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
        .then(([categories, post, allPosts, categoryAggregated]) => { // posts -> allPosts
            res.render('site/post', { categories: categories, post: post, allPosts: allPosts, categoryAggregated: categoryAggregated }); // posts -> allPosts
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