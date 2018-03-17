const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path')
const xss = require('xss');
var app = express();
var port = process.env.PORT || 3000;
var db = mongoose.connection;
var salt = 10;
var bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken');
var user = { name: 'Ricky Martinez' };
const accountSid = 'AC2f21ce42bb12b46e655ff00bca206e1d';
const authToken = '16d14b406048ed133a1471561fe43807';
const client = require('twilio')(accountSid, authToken);

//connecting to db
mongoose.connect('mongodb://Vazling:password-1@ds257848.mlab.com:57848/ricky');
mongoose.connection.on('err', function (err) {
    if (err) {
        throw err
    }
})

var Schema = mongoose.Schema;
var userSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    pic: {
        type: String,
        default: 'assets/img/ricky.jpg'
    },
    created: {
        type: Date,
        default: Date.now()
    },
    modified: {
        type: Date,
        default: Date.now()
    }


})

var ContactSchema = new Schema({
    FirstName: {
        type: String,
        required: true
    },
    LastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }

})

var user = mongoose.model('user', userSchema);
var ContactForm = mongoose.model('contact', ContactSchema);

// middle ware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({ origin: true, credentials: true }));

// app.use(express.static(path.join(__dirname, '../RickyWeb/dist')));
// app.get('', (req, res) => {
//     res.sendFile(path.join(__dirname, '../RickyWeb/dist/index.html'));
// });

var xssService = {
    sanitize: function (req, res, next) {
        var data = req.body
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                data[key] = xss(data[key]);
                console.log(data[key]);
            }
        }
        next();
    }
}

var bcryptService = {
    hash: function (req, res, next) {
        bcrypt.hash(req.body.password, salt, function (err, res) {
            if (err) throw err;
            req.body.password = res;
            console.log(res)
            next();
        })
    }
}

app.post('/register', xssService.sanitize, bcryptService.hash, function (req, res) {
    var newUser = user(req.body)
    newUser.save(function (err, prodcut) {
        if (err) throw err;
        res.status(200).send({
            type: true,
            data: "Succesful Register"
        });
    });
});


app.post('/admin/login', function (req, res) {
    user.findOne({ email: req.body.email }, 'password', function (err, product) {
        if (err) throw err;
        console.log(product);
        if (product === null) {
            res.status(200).send({
                type: false,
                data: "Email Invalid"
            })
        } else {
            bcrypt.compare(req.body.password, product.password, function (err, resp) {
                console.log(product.password)
                if (err) throw err;
                console.log(resp)
                if (resp) {
                    const token = jwt.sign({ user }, 'secret_key', { expiresIn: '300s' });
                    console.log("user's token: ", token);
                    res.status(200).send({
                        type: true,
                        data: 'User Logged In!',
                        token: token
                    })
                } else {
                    res.status(200).send({
                        type: false,
                        data: 'Password is incorrect'
                    })
                }
            })
            if (err) throw err;
            console.log(product)
        }

    })

})
app.post('/contact', xssService.sanitize, function (req, res) {
    var ContactSchema = new ContactForm(req.body);
    console.log(req.body);
    ContactSchema.save(function (err, product) {
        console.log('saving');
        if (err) throw err;
        client.messages
            .create({
                to: '+12137985365',
                from: '+12672142802 ',
                body: 'hdsdvhb',
            })
            .then(message => {
                console.log(message.sid)
                res.status(200).send({
                    type: true,
                    data: 'Form Information Submitted to Database!'
                })
            })
            .catch((err) => {
                if (err) throw err;
            })
            
    });
});

app.listen(port, () => {
        console.log('connected')
    })