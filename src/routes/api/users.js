const express = require('express');
const router = express.Router()
const Joi = require('joi');
const bcrypt = require('bcrypt');

const mongoose = require('mongoose')

// create schema of users
let userSchema = mongoose.Schema({
    name: {type: String},
    email: {type: String, unique:true},
    dob: {type: Date, default: Date.now()},
    password: {type: String},
    phone: {type: Number},
    addressLine1: {type : String, default: ""},
    addressLine2: {type : String, default: ""},
    pincode: {type : Number, default: null},
    state: {type : String, default: ""},
    city: {type : String, default: ""},
    token: {type: String, default: null},
    refreshToken: {type: String, default: null},
    isLogged: {type: Boolean, default: false}
})

let User = mongoose.model('user', userSchema);

router.get('/', async(req, res)=>{
    const { page = 1, limit = 20 } = req.query;
    const count = await User.countDocuments();
    
    await User.find(null, null, {skip: ((page - 1) * limit), limit: limit * 1}).then(result => {
        res.status(200).json({responseData: {users: result, totalPages: count, currentPage: page}, responseMessage: '', status: true})
    }).catch(err=>{
        console.log(err);
        res.status(500).json({
            responseData: null, responseMessage: err,status: false
        })
    })
})

router.get('/:id', async (req, res)=>{
    await User.findById(req.params.id).then(result=>{
        res.status(200).json({responseData: result, responseMessage: "",status: true});
    }).catch(err => {
        res.status(400).json({
            responseData: null, responseMessage: "User not found!",status: false
        })
    })
})

router.get('/profileById/:id', async (req, res)=>{
    await User.findById(req.params.id).then(result=>{
        res.status(200).json({responseData: result, responseMessage: "",status: true});
    }).catch(err => {
        res.status(400).json({
            responseData: null, responseMessage: "User not found!",status: false
        })
    })
})

router.delete('/:id', async (req, res)=>{
    await User.findByIdAndDelete(req.params.id).then(result=>{
        res.status(200).json({responseData: result, responseMessage: "",status: true});
    }).catch(err => {
        res.status(400).json({
            responseData: null, responseMessage: "User not found!",status: false
        })
    })
})

router.post('/createUser', async (req, res)=> {
    const {fullname, email, dob, password, phone, confirmPassword,addressLine1, addressLine2, pincode, state, city } = req.body;

    let schema = Joi.object({
        fullname : Joi.string().min(3).required(),
        email: Joi.string().min(10).required(),
        dob: Joi.date().required(),
        password: Joi.string().min(6).max(15).pattern(new RegExp('^[a-zA-Z0-9]{6,15}$')).required(),
        confirmPassword: Joi.ref('password'),
        phone: Joi.number().min(10).required(),
        addressLine1: Joi.string().min(3).max(20).required(),
        addressLine2: Joi.string().min(3).max(20).required(),
        pincode: Joi.number().min(6).required(),
        state: Joi.string().required(),
        city: Joi.string().required(),
    })

    let result = schema.validate(req.body);
    if(result.error) {
        return res.status(400).send({responseData : null , responseMessage : result.error.details[0].message, status: false});
    } else {

        let oldUser = await User.findOne({email})
        if(oldUser) {
            res.status(400).send({responseData: null, responseMessage: "User already exist",status: false})
        }

        let newUser = new User({
            name:fullname,
            email: email,
            dob: dob,
            password: password,
            phone: phone,
            addressLine1: addressLine1,
            addressLine2: addressLine2,
            pincode: pincode,
            state: state,
            city: city,
        })

        let salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(newUser.password, salt);
    
        let data = await newUser.save();
        res.status(200).send({ responseData: data, responseMessage: "User created!",status: true})
    }
})

router.post('/updateUser', async (req, res)=> {
    const {fullname, email, dob, password, phone, confirmPassword,addressLine1, addressLine2, pincode, state, city } = req.body;

    let schema = Joi.object({
        id: Joi.string().required(),
        fullname : Joi.string().min(3).required(),
        email: Joi.string().min(10).required(),
        dob: Joi.date().required(),
        // password: Joi.string().min(6).max(15).pattern(new RegExp('^[a-zA-Z0-9]{6,15}$')).required(),
        // confirmPassword: Joi.ref('password'),
        phone: Joi.number().min(10).required(),
        addressLine1: Joi.string().min(3).max(20).required(),
        addressLine2: Joi.string().min(3).max(20).required(),
        pincode: Joi.number().min(6).required(),
        state: Joi.string().required(),
        city: Joi.string().required(),
    })

    let result = schema.validate(req.body);
    if(result.error) {
        return res.status(400).send({responseData : null , responseMessage : result.error.details[0].message, status: false});
    } else {
        let oldUser = await User.findOne({email})
        if(oldUser) {
            res.status(400).send({responseData: null, responseMessage: "User already exist",status: false})
        }

        let newUser = {
            name:req.body.fullname,
            email: req.body.email,
            dob: req.body.dob,
            // password: req.body.password,
            phone: req.body.phone,
            addressLine1: req.body.addressLine1,
            addressLine2: req.body.addressLine2,
            pincode: req.body.pincode,
            state: req.body.state,
            city: req.body.city,
        }

        await User.findByIdAndUpdate(req.body.id, newUser, {new: true , upsert: true}).then(result=>{
            res.status(200).json({responseData: result, responseMessage: "User Updated!",status: true});
        }).catch(err => {
            res.status(400).json({
                responseData: null, responseMessage: err,status: false
            })
        })
    
    }
})


module.exports = router