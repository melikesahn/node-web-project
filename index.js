const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;
const path = require('path');


app.use(express.static('public'));
app.use((req, res, next) => {
    const ext = path.extname(req.url);
    switch (ext) {
      case '.css':
        res.type('text/css');
        break;
      case '.js':
        res.type('application/javascript');
        break;
      default:
        break;
    }
    next();
  });
  

// Veritabanı bağlantı ayarları
const pool = new Pool({
  user: 'postgres', // PostgreSQL kullanıcı adı
  host: 'localhost', // Veritabanı sunucu adresi
  database: 'dbusers', // Veritabanı adı
  password: '1234', // PostgreSQL şifresi
  port: 5432, // Veritabanı bağlantı portu (genellikle 5432)
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Kullanıcı kayıt işlemi fonksiyonunu ekleyin
const addUser = async (username, email, password) => {
    try {
      const query = `
        INSERT INTO "user" (username, email, password)
        VALUES ($1, $2, $3)
        RETURNING id
      `;
  
      const values = [username, email, password];
  
      const result = await pool.query(query, values);
  
      return result.rows[0].id;
    } catch (error) {
      console.error('Kullanıcı kayıt hatası:', error);
      throw error;
    }
  };
  
  // Kullanıcı giriş kontrolü fonksiyonunu ekleyin
  const checkLogin = async (username, password) => {
    try {
      const query = `
        SELECT id FROM "user"
        WHERE username = $1 AND password = $2
      `;
  
      const values = [username, password];
  
      const result = await pool.query(query, values);
  
      return result.rows.length > 0;
    } catch (error) {
      console.error('Giriş kontrol hatası:', error);
      throw error;
    }
  };
  

// Kullanıcı kayıt işlemi
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Kullanıcıyı veritabanına kaydediyoruz
    const userId = await addUser(username, email, password);
    res.status(201).json({ message: 'Kullanıcı başarıyla kaydedildi', userId });
  } catch (error) {
    res.status(500).json({ error: 'Kayıt işlemi başarısız oldu' });
  }
});

// Kullanıcı giriş kontrolü
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Kullanıcı girişini kontrol ediyoruz
    const isLoggedIn = await checkLogin(username, password);
    if (isLoggedIn) {
      res.status(200).json({ message: 'Giriş başarılı' });
    } else {
      res.status(401).json({ error: 'Giriş başarısız. Kullanıcı adı veya şifre hatalı.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Giriş işlemi başarısız oldu' });
  }
});

// Diğer istekler için gerekli yönlendirmeleri ekleyebilirsiniz
// Örneğin, "/about" sayfası için
app.get('/about', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'about.html');
  res.sendFile(filePath);
});

// Ana sayfa için GET isteği
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'index.html');
  res.sendFile(filePath);
});

// Belirlediğiniz portta sunucuyu dinlemeye başlayın
app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
});

