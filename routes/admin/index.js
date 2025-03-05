const express = require('express')
const router = express.Router()
const Category = require('../../models/Category')
const Post = require('../../models/Post')
const path = require('path')


router.get('/', (req, res) => {
    res.render('admin/index')
})

router.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find({})
            .populate({ path: 'category', model: Category })
            .sort({ updatedAt: -1 }); // veya updatedAt: -1

        res.render('admin/posts', { posts: posts });
    } catch (error) {
        console.error("Gönderileri alırken hata oluştu:", error);
        res.status(500).send("Gönderileri alırken bir hata oluştu. Lütfen tekrar deneyin.");
    }
});

router.get('/categories', (req, res) => {
    Category.find({}).sort({$natural: -1}).then(categories=>{
        res.render('admin/categories', {categories: categories})
    })
})


/* router.get('/blog', (req, res) => {
    Category.find({}).sort({$natural: -1}).then(categories => {
        res.render('blog', { categories: categories });
    });
}); */

router.post('/categories', (req, res) => {
    Category.create(req.body)
        .then(Category => {
            res.redirect('categories');
        })
        .catch(error => {
            console.error("Kategori oluşturma hatası:", error);
            res.send("Kategori oluşturulurken bir hata oluştu."); 
        });
});

router.delete('/categories/:id', async (req, res) => {
    try {
        const result = await Category.deleteOne({ _id: req.params.id });

        if (result.deletedCount === 0) {
            // Belirtilen ID ile eşleşen bir kategori bulunamadı
            return res.status(404).send('Kategori bulunamadı.');
        }

        res.redirect('/admin/categories');
    } catch (error) {
        console.error('Kategori silme hatası:', error);
        res.status(500).send('Kategori silinirken bir hata oluştu.');
    }
});

router.delete('/posts/:id', async (req, res) => {
    try {
        const result = await Post.deleteOne({ _id: req.params.id });

        if (result.deletedCount === 0) {
            // Belirtilen ID ile eşleşen bir Post bulunamadı
            return res.status(404).send('Post bulunamadı.');
        }

        res.redirect('/admin/posts');
    } catch (error) {
        console.error('Post silme hatası:', error);
        res.status(500).send('Post silinirken bir hata oluştu.');
    }
});

router.get('/posts/edit/:id', (req, res) => {
    Post.findOne({_id: req.params.id}).then(post => {
        Category.find({}).then(categories=>{
            res.render('admin/editpost', {post:post, categories: categories})
        })
    })
})

router.put('/posts/:id', (req, res) =>{
    let post_image = req.files.post_image
    post_image.mv(path.resolve(__dirname, '../../public/img/postimages', post_image.name))
    Post.findOne({_id: req.params.id}).then(post =>{
        post.title = req.body.title
        post.content = req.body.content
        post.date = req.body.date
        post.category = req.body.category
        post.post_image = `/img/postimages/${post_image.name}`

        post.save().then(post => {
            res.redirect('/admin/posts')
        })
    })
})

module.exports = router