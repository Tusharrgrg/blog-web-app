import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import bcrpt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from 'jsonwebtoken'
import cors from 'cors'

import User from "./Schema/User.js";

const app = express();
let PORT = 3000;

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.DB_LOCATION, {
    autoIndex: true,
});

const DataTosend = (user) => {
    const auth_token  = jwt.sign({id:user._id}, process.env.SECRET_ACCESS_KEY)
    return {
        auth_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname,
    };
};

const generateUserName = async (email) => {
    let username = email.split("@")[0];
    let isUserNameExists = await User.exists({
        "personal_info.username": username,
    }).then((result) => result);
    isUserNameExists ? (username += nanoid().substring(0, 5)) : "";
    return username;
};

app.post("/signup", (req, res) => {
    let { fullname, email, password } = req.body;
    if (fullname.length < 3) {
        return res
            .status(403)
            .json({ error: "Full Name must be at least 3 letters long" });
    }
    if (!email.length) {
        return res.status(403).json({ error: "Enter email" });
    }
    if (!emailRegex.test(email)) {
        return res.status(403).json({ error: "Email is invalid" });
    }
    if (!passwordRegex.test(password)) {
        return res
            .status(403)
            .json({
                error:
                    "password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters",
            });
    }

    bcrpt.hash(password, 10, async (err, hashed_password) => {
        let username = await generateUserName(email);
        let user = new User({
            personal_info: { fullname, email, password: hashed_password, username },
        });

        user
            .save()
            .then((u) => {
                return res.status(200).json(DataTosend(u));
            })
            .catch((err) => {
                if (err.code === 11000) {
                    return res.status(500).json({ error: "Email already exist" });
                }
                return res.status(500).json({ error: err.message });
            });
    });

    // return res.status(200).json({"status":"ok"})
});

app.post("/signin", (req, res) =>{
    let {email, password} = req.body;
    User.findOne({"personal_info.email" : email})
    .then((user)=>{
        if(!user){
            return res.status(403).json({"error" : "Email not found"})
        }
        bcrpt.compare(password, user.personal_info.password, (err ,result)=>{
            if(err){
                return res.status(403).json({"error" : "error accured while login please try again"})
            }
            if(!result){
                return res.status(403).json({"error":"Incorrect Password"});
            }else{
                return res.status(200).json(DataTosend(user))
            }
        })
        // console.log(user);
        // return res.json({"status":"got user document"});
    })
    .catch(err =>{
        // console.log(err);
        return res.status(500).json({"error" : err.message})
    })
})

app.listen(PORT, () => {
    console.log("server running at 3000 port");
});
