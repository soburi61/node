const express = require('express');
const app = express();
app.use(express.static('public'));


app.get('/index',(req,res) => {
    res.render('index.ejs');
});
console.log('10.133.90.88:3000/index')
app.listen(3000,'10.133.90.88');