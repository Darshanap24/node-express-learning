const express = require('express');
const router = express.Router()
const Joi = require('joi');
const jwt = require("jsonwebtoken");

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = process.env;

let User = mongoose.model('user');


router.post('/register', async (req, res)=> {

    try {

        const {fullname, email, dob, password, phone} = req.body;
    
        let schema = Joi.object({
            fullname : Joi.string().min(3).required(),
            email: Joi.string().min(10).required(),
            dob: Joi.date().required(),
            password: Joi.string().min(6).max(15).pattern(new RegExp('^[a-zA-Z0-9]{6,15}$')).required(),
            confirmPassword: Joi.ref('password'),
            phone: Joi.number().min(10).required(),
        })
    
        let result = schema.validate(req.body);
    
    
        if(result.error) {
            return res.status(400).send({responseData : null , responseMessage : result.error.details[0].message, status: false});
        } 
    
        let oldUser = await User.findOne({email})
        if(oldUser) {
            res.status(400).send({responseData: null, responseMessage: "User already exist",status: false})
        }

        // Create new user
        const newUser = await User.create({
            name:fullname,
            email: email,
            dob: dob,
            phone: phone,
            addressLine1: "",
            addressLine2: "",
            pincode: null,
            state: null,
            city: null
        });

        // Create token
        const token = jwt.sign(
            { user_id: newUser._id, email },
            process.env.TOKEN_KEY,
            {
            expiresIn: "1h",
            }
        );

        // Create refresh token
        const refreshToken = jwt.sign(
            { user_id: newUser._id, email },
            process.env.REFRESH_TOKEN_KEY,
            {
            expiresIn: "1h",
            }
        );

        newUser.token = token;
        newUser.refreshToken = refreshToken;
        newUser.isLogged = true;

        // Encrypt password
        let salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);

        let data = await newUser.save();

        res.status(200).json({ responseData: data, responseMessage: "Sign in successful!",status: true})
        
    } catch(e){
        console.log("Error", e)
    }
})

router.post('/login', async (req, res)=>{
    try {

        let { username , password }= req.body;
    
        let schema = Joi.object({
            username: Joi.string().required().email(),
            password: Joi.string().required()
        })
        let result = schema.validate(req.body);
        if(result.error) {
            return res.status(400).send({responseData : null , responseMessage : result.error.details[0].message, status: false});
        }
        
        let userMatch = await User.findOne({email:username})
        // console.log("username", userMatch);
        
        if(!userMatch){ 
            res.status(400).send({responseData : null , responseMessage : "Invalid Username", status: false}) 
        }
        
        if(userMatch) {
            let passwordMatch = await bcrypt.compare(password, userMatch.password)
            if(!passwordMatch)
            res.status(400).send({responseData : null , responseMessage : "Invalid Password", status: false}) 
    
            if(passwordMatch){
                 // Create token
                const token = jwt.sign(
                    { user_id: userMatch._id, email:username },
                    process.env.TOKEN_KEY,
                    {
                    expiresIn: "1h",
                    }
                );
                
                // Create refresh token
                const refreshToken = jwt.sign(
                    { user_id: userMatch._id, email: username },
                    process.env.REFRESH_TOKEN_KEY,
                    {
                    expiresIn: "1h",
                    }
                );

                userMatch.token = token;
                userMatch.refreshToken = refreshToken;
                userMatch.isLogged = true;

            let data = await userMatch.save();
    
                res.status(200).send({responseData: data, responseMessage: "Login Successful!", status : true})
            }
        } 
        } catch(e) {
            console.log(e)
        }

})

router.post('/refreshtoken', async (req, res)=>{
    try {
        const tokenToRefresh = req.body.token;

        const decoded = jwt.verify(tokenToRefresh, config.REFRESH_TOKEN_KEY)

        if(decoded) {
            const token = jwt.sign(
                { user_id: decoded._id, email: decoded.email },
                process.env.TOKEN_KEY,
                {
                expiresIn: "1h",
                }
            );
    
              const refreshToken = jwt.sign(
                { user_id: decoded._id, email: decoded.email },
                process.env.REFRESH_TOKEN_KEY,
                {
                expiresIn: "1h",
                }
            );

            let data = {
                token,
                refreshToken
            }
            
            res.status(200).send({ responseData: data, responseMessage: "Token Refreshed!", status: true})
        } else {
            res.status(400).json({ responseData: null, responseMessage: "Invalid Token!", status: false})
        }

          
    } catch(e) {
        console.log(e);
    }
})

module.exports = router;