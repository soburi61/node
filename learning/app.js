const express = require('express');
const app = express();
app.use(express.static('public'));


app.get('/',(req,res) => {
    res.render('top.ejs');
});
console.log('10.133.90.88:3000/top')
app.listen(3000,'10.133.90.88');