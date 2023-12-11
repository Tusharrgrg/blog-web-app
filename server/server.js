import express, { json } from "express";
import mongoose from "mongoose";
import "dotenv/config";
import bcrpt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import cors from "cors";
import admin from "firebase-admin";
import serviceKey from "./ishare-blog-app-firebase-adminsdk-735m1-fab85a1028.json" assert { type: "json" };
import { getAuth } from "firebase-admin/auth";
import aws from "aws-sdk";

import User from "./Schema/User.js";
import Blog from "./Schema/Blog.js";
import Notification from './Schema/Notification.js';
import Comment from './Schema/Comment.js'

const app = express();
let PORT = 3000;

admin.initializeApp({
  credential: admin.credential.cert(serviceKey),
});

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

app.use(express.json());
app.use(cors()); // cross origin resource sharing for communicate with frontend

// connect with database
mongoose.connect(process.env.DB_LOCATION, {
  autoIndex: true,
});

// set up s3 bucket
const s3_bucket = new aws.S3({
  region: "ap-south-1",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// function to generate upload image url from aws
const generateUploadUrl = async () => {
  const date = new Date();
  const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

  return await s3_bucket.getSignedUrlPromise("putObject", {
    Bucket: "blogging-web-app",
    Key: imageName,
    Expires: 1000,
    ContentType: "image/jpeg",
  });
};

// function to verify jwt 
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({ error: "No Access Token" });
  }
  jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "access token is invalid" });
    }
    req.user = user.id;
    next();
  });
};

// function to send data to frontend
const DataTosend = (user) => {
  const auth_token = jwt.sign({ id: user._id }, process.env.SECRET_ACCESS_KEY);
  return {
    auth_token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
  };
};

// generate user name function to generate username through email id
const generateUserName = async (email) => {
  let username = email.split("@")[0];
  let isUserNameExists = await User.exists({
    "personal_info.username": username,
  }).then((result) => result);
  isUserNameExists ? (username += nanoid().substring(0, 5)) : "";
  return username;
};



// upload image url route
app.get("/get-upload-url", (req, res) => {
  generateUploadUrl()
    .then((url) => res.status(200).json({ uploadUrl: url }))
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

// signup route
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
    return res.status(403).json({
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

// signin Route
app.post("/signin", (req, res) => {
  let { email, password } = req.body;
  User.findOne({ "personal_info.email": email })
    .then((user) => {
      if (!user) {
        return res.status(403).json({ error: "Email not found" });
      }
      bcrpt.compare(password, user.personal_info.password, (err, result) => {
        if (err) {
          return res
            .status(403)
            .json({ error: "error accured while login please try again" });
        }
        if (!result) {
          return res.status(403).json({ error: "Incorrect Password" });
        } else {
          return res.status(200).json(DataTosend(user));
        }
      });
      // console.log(user);
      // return res.json({"status":"got user document"});
    })
    .catch((err) => {
      // console.log(err);
      return res.status(500).json({ error: err.message });
    });
});

// continue with google route -> google-auth route
app.post("/google-auth", async (req, res) => {
  let { auth_token } = req.body;
  // console.log(auth_token)
  getAuth()
    .verifyIdToken(auth_token)
    .then(async (decodedUser) => {
      let { email, name, picture } = decodedUser;
      picture = picture.replace("s96-c", "s384-c");

      let user = await User.findOne({ "personal_info.email": email })
        .select(
          "personal_info.fullname personal_info.username personal_info.profile_img google_auth"
        )
        .then((u) => {
          return u || null;
        })
        .catch((err) => {
          return res.status(500).json({ error: err.message });
        });

      if (user) {
        // login
        if (!user.google_auth) {
          return res
            .status(403)
            .json({ error: "Please login with password to access the acount" });
        }
      } else {
        // signup
        let username = await generateUserName(email);
        user = new User({
          personal_info: { fullname: name, email, username },
          google_auth: true,
        });

        await user
          .save()
          .then((u) => {
            user = u;
          })
          .catch((err) => {
            return res.status(500).json({ error: err.message });
          });
      }

      return res.status(200).json(DataTosend(user));
    })
    .catch((err) => {
      res.status(500).json({
        error:
          "Failde to authenticate with google. Try with some other account",
      });
    });
});

// lates-blog route we dont need any validation for this
app.post("/latest-blogs", (req, res) => {
  let maxLimit = 5;
  let { page } = req.body

  Blog.find({ draft: false })
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({ "publishedAt": -1 })
    .select("blog_id title des banner tags activity publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then(blogs => {
      return res.status(200).json({ blogs })
    })
    .catch(err => {
      return res.status(500).json({ error: err.message })
    })
})

// count total number of blogs route
app.post('/all-latest-blogs-count', (req, res) => {
  Blog.countDocuments({ draft: false })
    .then((count) => {
      return res.status(200).json({ totalDocs: count })
    })
    .catch(err => {
      return res.status(500).json({ error: err.message })
    })
})

// trending blogs route
app.get("/trending-blogs", (req, res) => {
  Blog.find({ draft: false })
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({ "activity.total_read": -1, "activity.total_likes": -1, "publishedAt": -1 })
    .select("blog_id title publishedAt -_id")
    .limit(5)
    .then(blogs => {
      return res.status(200).json({ blogs });
    })
    .catch(err => {
      return res.status(500).json({ error: err.message })
    })
})

app.post('/search-blogs', (req, res) => {
  let { tag, query, author, page, limit, eliminate_blog } = req.body;

  let findQuery

  if (tag) {
    findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_blog } }
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, 'i') }
  } else if (author) {
    findQuery = { author, draft: false }
  }


  let maxLimit = limit ? limit : 2;
  Blog.find(findQuery)
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({ "publishedAt": -1 })
    .select("blog_id title des banner tags activity publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then(blogs => {
      return res.status(200).json({ blogs })
    })
    .catch(err => {
      return res.status(500).json({ error: err.message })
    })
})

// search blog by category 
app.post('/search-blogs-count', (req, res) => {
  let { tag, author, query } = req.body;
  let findQuery

  if (tag) {
    findQuery = { tags: tag, draft: false }
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, 'i') }
  } else if (author) {
    findQuery = { author, draft: false }
  }

  Blog.countDocuments(findQuery)
    .then((count) => {
      return res.status(200).json({ totalDocs: count })
    })
    .catch(err => {
      return res.status(500).json({ error: err.message })
    })
})

// route for searching users 
app.post('/search-users', (req, res) => {

  let { query } = req.body;
  User.find({ "personal_info.username": new RegExp(query, 'i') })
    .limit(50)
    .select("personal_info.fullname personal_info.username personal_info.profile_img -_id")
    .then((users) => {
      return res.status(200).json({ users })
    })
    .catch(err => {
      return res.status(500).json({ error: err.message })
    })
})

// get user's profile data
app.post('/get-profile', (req, res) => {
  let { username } = req.body;
  User.findOne({ "personal_info.username": username })
    .select("-personal_info.password -google_auth -updatedAt -blogs")
    .then((user) => {
      return res.status(200).json(user)
    })
    .catch(err => {
      return res.status(500).json({ error: err.message })
    })
})

// create-blog route 
app.post("/create-blog", verifyJWT, (req, res) => {

  let authorId = req.user;

  let { title, des, banner, tags, content, draft, id } = req.body;

  // console.log(req.body)
  if (!title.length) {
    return res.status(403).json({ error: "You must provide a title to publish the blog" })
  }

  if (!draft) {

    if (!des.length || des.length > 200) {
      return res.status(403).json({ error: "You must provide blod description under 200 characters" })
    }

    if (!banner.length) {
      return res.status(403).json({ error: "You must provide a Banner to publish the blog" })
    }

    if (!content.blocks.length) {
      return res.status(403).json({ error: 'There must be some blog content to publish it' })
    }

    if (!tags.length || tags.length > 10) {
      return res.status(403).json({ error: "Provide tags in order to publish the blog, Maximum 10" })
    }
  }

  tags = tags.map(tag => tag.toLowerCase());

  let blog_id = id || title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, '-').trim() + nanoid();

  if (id) {
    Blog.findOneAndUpdate({ blog_id }, { title, des, banner, content, tags, draft: draft ? draft : false })
      .then(() => {
        return res.status(200).json({ id: blog_id })
      })
      .catch((err) => {
        res.status(500).json({ error: err.message })
      })

  } else {
    let blog = new Blog({
      title, des, banner, content, tags, author: authorId, blog_id, draft: Boolean(draft)
    })

    // console.log(blog)
    blog
      .save()
      .then((blog) => {
        let incrementVal = draft ? 0 : 1;
        User.findOneAndUpdate({ _id: authorId }, { $inc: { "account_info.total_posts": incrementVal }, $push: { "blogs": blog._id } })
          .then(user => {
            return res.status(200).json({ id: blog.blog_id })
          })
          .catch((err) => {
            return res.status(500).json({ error: "failed to update total blog number" })
          })
      }).catch((err) => {
        return res.status(500).json({ error: err.message });
      })
  }
});

// get the blog details when a user click on particular blog
app.post('/get-blog', (req, res) => {
  let { blog_id, draft, mode } = req.body;
  let incrementVal = mode !== 'edit' ? 1 : 0;

  Blog.findOneAndUpdate({ blog_id: blog_id }, { $inc: { "activity.total_reads": incrementVal } })
    .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
    .select("title des banner tags content activity publishedAt blog_id")
    .then(blog => {
      User.findOneAndUpdate({ "personal_info.username": blog.author.personal_info.username }, { $inc: { "account_info.total_reads": incrementVal } })
        .catch(err => {
          return res.status(500).json({ error: err.message })
        })


      if (blog.draft && !draft) {
        return res.status(500).json({ error: 'you can not access draft blog' })
      }

      return res.status(200).json({ blog });

    })
    .catch(err => {
      return res.status(500).json({ error: err.message });
    })

})

// 
app.post('/like-blog', verifyJWT, (req, res) => {

  let authorId = req.user;

  let { _id, isLikedByUser } = req.body;

  let incrementalVal = !isLikedByUser ? 1 : -1;

  Blog.findOneAndUpdate({ _id }, { $inc: { "activity.total_likes": incrementalVal } })
    .then((blog) => {
      if (!isLikedByUser) {
        let like = new Notification({
          type: 'like',
          blog: _id,
          notification_for: blog.author,
          user: authorId
        })

        like.save().then(notification => {
          return res.status(200).json({ liked_by_user: true });
        })
      } else {
        Notification.findOneAndDelete({ user: authorId, blog: _id, type: 'like' })
          .then(data => {
            return res.status(200).json({ liked_by_user: false });
          })
          .catch(err => {
            return res.status(500).json({ error: err.message });
          })
      }
    })

})

app.post('/isliked-by-user', verifyJWT, (req, res) => {

  let user_id = req.user;
  let { _id } = req.body;

  Notification.exists({ user: user_id, type: 'like', blog: _id })
    .then((result) => {
      return res.status(200).json({ result });
    })
    .catch(err => {
      return res.status(500).json({ error: err.message })
    })
})

app.post('/add-comment', verifyJWT, (req, res) => {
  let user_id = req.user;

  let { _id, comment, replying_to, blog_author } = req.body;

  if (!comment.length) {
    return res.status(403).json({ error: "write something to post comment" })
  }

  // create comment doc
  let commentObj = {
    blog_id: _id, blog_author, comment, commented_by: user_id
  }

  // check if replying_to is undefined or not if it is undefined then we will create a parent comment else we will create a replying comment
  if (replying_to) {
    commentObj.parent = replying_to;
    commentObj.isReply = true;
  }

  new Comment(commentObj).save().then(async (commentFile) => {
    let { comment, commentedAt, children } = commentFile;
    Blog.findOneAndUpdate({ _id }, { $push: { "comments": commentFile._id }, $inc: { "activity.total_comments": 1, "activity.total_parent_comments": replying_to ? 0 : 1 } })
      .then(blog => {
        console.log("New comment created");
      })

    let notificationObj = {
      type: replying_to ? "reply" : "comment",
      blog: _id,
      notification_for: blog_author,
      user: user_id,
      comment: commentFile._id,
    }

    if(replying_to){
      notificationObj.replied_on_comment = replying_to;
      await Comment.findOneAndUpdate({_id:replying_to}, {$push :{children : commentFile._id} })
      .then((replyingToComment)=>{
        notificationObj.notification_for = replyingToComment.commented_by
      })
    }

    new Notification(notificationObj).save().then(notification => console.log("new Notification Created"))

    return res.status(200).json({ comment, commentedAt, _id: commentFile._id, children })
  })
})

app.post('/get-blog-comments', (req, res) => {
  let { blog_id, skip } = req.body;
  let maxLimit = 5;

  // console.log(req.body)
  Comment.find({ blog_id, isReply: false })
    .populate("commented_by", "personal_info.fullname personal_info.username personal_info.profile_img")
    .skip(skip)
    .limit(maxLimit)
    .sort({
      'commentedAt': -1
    })
    .then(comment => {
      res.status(200).json(comment);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err.message })
    })
})

app.post('/get-replies', (req, res)=>{

  let {_id, skip} = req.body;

  let maxLimit = 5;

  Comment.findOne({_id}).populate({
    path :"children",
    option :{
      limit : maxLimit,
      skip : skip,
      sort: {'commentedAt' : -1}
    },
    populate : {
      path :'commented_by',
      select : 'personal_info.profile_img personal_info.username personal_info.fullname'
    },
    select : '-blog_id -updatedAt'
  })
  .select("children")
  .then(doc =>{
    return res.status(200).json({replies : doc.children})
  })
  .catch(err=>{
    return res.status(500).json({error : err.message})
  })
})

// function to delelte comments
const deleteComments = (_id) =>{

  Comment.findOneAndDelete({_id}).then(comment => {
    if(comment.parent){
      Comment.findOneAndUpdate({_id : comment.parent}, {$pull : {children : _id}})
      .then(data => console.log('Comment deleted from parent'))
      .catch(err => console.log(err))
    }

    Notification.findOneAndDelete({comment : _id}).then(notification =>{
      console.log('comment notification deleted');
    })
    Notification.findOneAndDelete({reply : _id}).then(notification =>{
      console.log('reply notification deleted');
    })

    Blog.findOneAndUpdate({_id : comment.blog_id}, {$pull : {comments : _id}, $inc :{'activity.total_comments' : -1}, 'activity.total_parent_comments':comment.parent ? 0 : -1})
    .then(blog =>{
      if(comment.children.length){
        comment.children.map(replies=>{
          deleteComments(replies)
        })
      }
    })

  })
  .catch(err =>{
    console.log(err.message);
  })
}


app.post('/delete-comment', verifyJWT, (req, res)=>{

  let user_id = req.user;

  let {_id} = req.body;

  Comment.findOne({_id}).then(comment =>{

    if(user_id == comment.commented_by || user_id == comment.blog_author){
      deleteComments(_id);

      return res.status(200).json({status :'done'})

    }else{
      return res.status(403).json({error : "you can not delete this comment"})
    }
  })

})

app.listen(PORT, () => {
  console.log("server running at 3000 port");
});
