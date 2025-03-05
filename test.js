const mongoose = require('mongoose')

const Post = require('/models/Post')

mongoose.connect('mongodb://localhost:27017/nodeblog_db')
.then(() => console.log('MongoDB bağlantısı başarılı'))
.catch(err => console.error('MongoDB bağlantı hatası:', err));

Post.findByIdAndDelete(
    '67b628140299251bf5fe8c48'
)
.catch(error => console.error(error));


/* Post.findByIdAndUpdate(
    '67b628140299251bf5fe8c48',
    { title: 'Benim güncellenecek başlığım' },
    { new: true } // Güncellenmiş belgeyi döndür
)
.then(post => console.log(post))
.catch(error => console.error(error));
 */

/* Post.findById('67b628140299251bf5fe8c48')
.then(post => console.log(post))
.catch(error => console.error(error));  */

/* 
Post.find({ 
    title:('Benim ilk post başlığım')
 })
    .then(post => console.log(post))
    .catch(error => console.error(error)); 
*/


/* async function createPost() {
    try {
      const post = await Post.create({
        title: 'Benim ilk post başlığım',
        content: 'Post içeriği, lorem ipsum text'
      });
      console.log('Post başarıyla oluşturuldu:', post);
    } catch (error) {
      console.error('Post oluşturulurken hata oluştu:', error);
    }
  }
  
createPost(); */