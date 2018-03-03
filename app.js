const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path')
var app = express();
var port = process.env.PORT || 3000;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.use(express.static(path.join(__dirname, '../RickyWeb/dist')));
app.get('', (req, res) => {
    res.sendFile(path.join(__dirname, '../RickyWeb/dist/index.html'));
});



app.listen(port, ()=>{
    console.log('connected')
})

