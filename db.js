const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const { data } = require('jquery');

const app = express();
const port = 3000;


app.use(cors());
app.use(bodyParser.json());


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, './src/assets/images');
        cb(null, uploadPath); 
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Kết nối vào cơ sở dữ liệu MySQL
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '1234',
  port: '3306',
  database: 'book_db'
});

// Kết nối đến cơ sở dữ liệu
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});


app.get('/genres', (req, res) => {
  const sql = 'SELECT * FROM genres';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(results);
  });
});

app.get('/user', (req, res) => {
  const sql = 'SELECT User.`userName`,`User`.`userPass`  FROM User';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).send('Internal Server Error');
      res.json('that bai');
      return;
    }
    res.json(results);
  });
});
app.get('/login', (req, res) => {
  const sql = 'SELECT User.`userName`,`User`.`userPass`  FROM User';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).send('Internal Server Error');
      res.json('that bai');
      return;
    }
    res.json(results);
  });
});
// app.get('/login', (req, res) => {
//   const userID= req.body;
//   const sql = ' SELECT User.`userName`,`User`.`userPass`  FROM User WHERE `userID`= ?';
//   connection.query(sql,userID, (err, results) => {
//     if (err) {
//       console.error('Error querying database:', err);
//       res.status(500).send('Internal Server Error');
//       return;
//     }
//     res.json(results);
//   });
// });
app.post('/login', (req, res) => {
  const newUser= req.body;
  const sql = 'INSERT INTO User SET ?';
  connection.query(sql, newUser, (err, results) => {
    if (err) {
      console.error('Error inserting into database:', err);
      res.status(500).send('Internal Server Error');
      res.json(newUser);
      return;
    }
  // var token =  jwt.sign( {_id:newUser._id},'mk' )
  // return res.jon({
  //   token:token
  // }),
  //   res.status(201).json({ id: results.insertId, ...newUser });
  // });
  var token = jwt.sign({ _userID: results._userID }, 'mk' , {expiresIn:'60m'});
  res.status(201).json({
    message: 'Thanh cong',
    token: token,
    expiresIn: 3600,
    idToken: token,
    ...newUser
  });
});
});





function authenticateToken(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, 'mk');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
}

app.use('/protected', authenticateToken, (req, res) => {
  res.send('This is a protected route');
});







app.get('/datboard/:token',(req,res,next)=>{
  try {
    var token = req.params.token;
    var ketqua =  jwt.verify(token,'mk');
    if(ketqua){
      next()
    }
  } catch (error) {
    return res.json('ban can pphai login');
  }
}),(req,res,next)=>{
  console.error('111111e:');
}




app.get('/bookgenre', (req, res) => {
  const sql = `SELECT * FROM bookgenres `;
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(results);
  });
});

// app.get('/bookgenre', (req, res) => {
//   const sql = 'SELECT * FROM Genres JOIN BookGenres ON `Genres`.`genreID` = BookGenres.`genreID` JOIN books ON BookGenres.`bookID` = books.`bookID` WHERE books.`bookID`=`Genres`.`genreID`';
//   connection.query(sql, (err, results) => {
//     if (err) {
//       console.error('Error querying database:', err);
//       res.status(500).send('Internal Server Error');
//       return;
//     }
//     res.json(results);
//   });
// });
// app.get('/bookgenre', (req, res) => {
//   const sql = ' SELECT books.bookID, books.title, books.published_date, books.description, books.price, books.stock_quantity, books.image, Genres.genreID, Genres.name AS genreName  FROM books  JOIN BookGenres ON books.bookID = BookGenres.bookID  JOIN Genres ON BookGenres.genreID = Genres.genreID';
//   connection.query(sql, (err, results) => {
//     if (err) {
//       console.error('Error querying database:', err);
//       res.status(500).send('Internal Server Error');
//       return;
//     }
//     res.json(results);
//   });
// });

app.post('/bookgenre', (req, res) => {
  const { bookID, genreID } = req.body;
  const newBookGenres = { bookID, genreID };
  const sql = 'INSERT INTO BookGenres SET ?';

  connection.query(sql, newBookGenres, (err, results) => {
    if (err) {
      console.error('Error inserting into database:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    console.log('BookGenre added successfully');
    res.status(201).json({ id: results.insertId, ...newBookGenres });
  });
});
app.get('/books/getgenre', (req, res) => {
  const genreID = req.query.genreID; 

  if (!genreID || isNaN(genreID)) {
    res.status(400).json({ error: 'Invalid genreID' });
    return;
  }

  const sql = 'SELECT * FROM books JOIN Genres ON Genres.genreID = books.genreID WHERE books.genreID = ?';

  connection.query(sql, genreID, (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(results);
  });
});
app.get('/search', (req, res) => {
  const title = req.query.title;
 

  
  if (!title) {
    res.status(400).json({ error: 'Invalid genreID' });
    return;
  }

  const sql = ' SELECT * FROM books WHERE title LIKE ?';
  connection.query(sql, [`%${title}%`], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(results);
  });
});

app.post('/books', (req, res) => {
  const newBook = req.body;
  const sql = 'INSERT INTO books SET ?';
  connection.query(sql, newBook, (err, results) => {
    if (err) {
      console.error('Error inserting into database:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.status(201).json({ id: results.insertId, ...newBook });
  });
});
app.post('/genres', (req, res) => {
  const genre = req.body;
  const sql = 'INSERT INTO genres SET ?';
  connection.query(sql, genre, (err, results) => {
    if (err) {
      console.error('Error inserting into database:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.status(201).json({ id: results.insertId, ...genre });
  });
});
app.get('/books', (req, res) => {
  const sql = 'SELECT * FROM books';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(results);
  });
});


app.get('/books/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM books WHERE bookID = ?';
  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(result[0]);
  });
});

app.put('/books/:id', (req, res) => {
  const { id } = req.params;
  const updatedBook = req.body;
  const sql = 'UPDATE books SET ? WHERE bookID = ?';
  connection.query(sql, [updatedBook, id], (err, result) => {
    if (err) {
      console.error('Error updating database:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json({ id, ...updatedBook });
  });
});

app.delete('/books/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM books WHERE bookID = ?';
  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting from database:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.status(204).send();
  });
});


app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Không có tệp nào được tải lên.');
    }
    res.send({ filePath: `./src/assets/images/${req.file.filename}` });
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// app.get('/login',(req,res,next)=>{
  
// })


// app.post('/login', (req, res) => {
//   const { username, password } = req.body;
//   const Account = { username, password };
//   const sql = 'INSERT INTO User SET ?';

//   connection.query(sql, Account, (err, results) => {
//     if (err) {
//       console.error('Error inserting into database:', err);
//       res.status(500).send('Internal Server Error');
//       return;
//     }
//     console.log('BookGenre added successfully');
//     res.status(201).json({ id: results.insertId, ...Account });
//   });
// });


const uploadPort = 3001;
app.listen(uploadPort, () => {
    console.log(`Upload server is running on http://localhost:${uploadPort}`);
});
