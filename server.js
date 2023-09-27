const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const app = express();
const port = 3000;

// ============= Handlebars shit =============
const exphbs = require('express-handlebars');
app.engine('hbs', exphbs.engine({ defaultLayout: 'main', extname: 'hbs'}));
app.set('view engine', 'hbs');

// =============  Images array to keep track of the history =============
let images = [];

// =============  MiddleWare aka Multer =============
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
       cb(null, Date.now() + path.extname(file.originalname)); // Adding a timestamp before the file's original name
    }
 });
 
const upload = multer({ storage: storage });

// =============  ROUTES =============
app.post('/upload', upload.single('image'), (req, res) => {
    // Convert image to square using Sharp
    sharp(req.file.path)
        .resize(256, 256, {
            fit: 'cover'
        })
        .toFile(path.join(__dirname, 'uploads', 'square_' + req.file.filename), (err) => {
            if (err) {
                // Handle the error appropriately
                console.error("Error processing image:", err);
                return res.status(500).send("Error processing image");
            }

            // Add to images array and limit its length to 5
            images.unshift({ original: req.file.filename, square: 'square_' + req.file.filename });
            if (images.length > 5) {
                images.pop();
            }

            res.redirect('/');
        });
});

app.get('/', (req, res) => {
    res.render('index', { images: images });
 });
 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============= Serving =============

app.listen(port, () => {
   console.log(`Server started on http://localhost:${port}`);
});
