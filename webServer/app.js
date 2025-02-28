
require('custom-env').env(process.env.NODE_ENV || 'local', './config');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const UserRoutes = require('./routes/UserRoutes.js');
const AuthRoutes = require('./routes/AuthRoutes.js');
const category = require('./routes/CategoryRoute');
const movie = require('./routes/MovieRoute');
const path = require('path');
const fs = require('fs');


console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('CONNECTION_STRING:', process.env.CONNECTION_STRING);
mongoose.connect(process.env.CONNECTION_STRING,{});
var app = express();

const frontendPort = process.env.FRONTEND_PORT || '3001';

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log("Headers:", req.headers);
    console.log("Body (raw):", req.rawBody);
    console.log("Body (parsed):", req.body);
    console.log("Content-Type:", req.headers['content-type']);
    next(); 
});

app.use(cors({
  origin: [`http://localhost:${frontendPort}`, 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(express.json());
const uploadDirs = ['videos', 'trailers', 'images'].map(dir => 
    path.join(__dirname, 'public/uploads', dir)
  );
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  // Serve static files from public directory
  app.use('/static', express.static(path.join(__dirname, 'public/uploads'), {
    setHeaders: (res, path, stat) => {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  }
}));

app.use('/api/categories', category);
app.use('/api/movies', movie);
app.use('/api/users', UserRoutes);
app.use('/api/tokens', AuthRoutes);
app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
});


app.listen(process.env.PORT);



