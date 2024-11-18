const express = require('express') ;
const app = express() ;
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');

const server = http.createServer(app);
const io = new Server(server);

const user = require('./routes/users') ;
const category = require('./routes/categories') ;
const product = require('./routes/products') ;
const favorite = require('./routes/favorites') ;
const order = require('./routes/orders') ;
const comment = require('./routes/comments') ;

app.use(express.json()) ;
// app.use(cors()); // Enable CORS for frontend communication if necessary
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/user', user) ;
app.use('/api/category', category) ;
app.use('/api/product', product) ;
app.use('/api/favorite', favorite) ;
app.use('/api/order', order) ;
app.use('/api/comment', comment) ;

io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
});

server.listen(3000 ,() => console.log('connected')) ;