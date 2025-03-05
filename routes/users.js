const express = require('express')
const router = express.Router()
const User = require('../models/User')

router.get('/register', (req, res)=>{
    res.render('site/register')
})

router.get('/login', (req, res) => {
    res.render('site/login')
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email });

        if (user) {
            if (user.password === password) { // Şifre karşılaştırması
                req.session.userId = user._id;
                res.redirect('/');
            } else {
                res.redirect('/login'); // Hatalı şifre
            }
        } else {
            res.redirect('/register'); // Kullanıcı bulunamadı
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Internal Server Error'); // Hata yönetimi
    }
});

router.post('/register', (req, res) => {
    User.create(req.body)
      .then(user => {
        req.session.sessionFlash = {
            type: 'alert alert-success',
            message: 'Kullanıcı başarılı bir şekilde kayıt oluşturuldu.'
        }
        res.redirect('/users/login');
      })
      .catch(error => {
        console.error("Kayıt hatası:", error);
        res.render('site/register', { error: 'Kayıt sırasında bir hata oluştu.' });
      });
  });

  router.get('/logout', (req, res) => {
    req.session.destroy(()=>{
        res.redirect('/')
    })
})

module.exports = router