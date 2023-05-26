const express = require('express');
const app = express();
app.use(express.static('public'));
app.get('/index',(req,res) => {
    res.render('top.ejs')
});
app.listen(3000);