import { Link, useNavigate } from "react-router-dom";
import logo from "../imgs/ishare-favicon-black.png";
import AnimationWrap from "../common/page-animation";
import bannerImg from "../imgs/blog banner.png";
import { uploadImage } from "../common/aws";
import { useContext } from "react";
import toast, { Toaster } from "react-hot-toast";
import { EditorContext } from "../pages/editor-page";
import { useEffect } from "react";
import EditorJS from "@editorjs/editorjs";
import { tools } from "./tools-comp";
import axios from "axios";
import { UserContext } from "../App";

const BlogEditor = () => {
  let {
    blog,
    blog: { title, banner, content, tags, des },
    setBlog,
    textEditor,
    setTextEditor,
    setEditorState,
  } = useContext(EditorContext);

  let {
    userAuth: { auth_token },
  } = useContext(UserContext);

  let navigate = useNavigate();

  useEffect(() => {
    if (!textEditor.isReady) {
      setTextEditor(
        new EditorJS({
          holder: "textEditor",
          data: content,
          tools: tools,
          placeholder: "Let's write an awesome story",
        })
      );
    }
  }, []);

  const handleBannerUpload = (e) => {
    let img = e.target.files[0];
    if (img) {
      let loadingToast = toast.loading("Uploading...");
      uploadImage(img)
        .then((url) => {
          if (url) {
            toast.dismiss(loadingToast);
            toast.success("Uploaded👍");
            setBlog({ ...blog, banner: url });
          }
        })
        .catch((err) => {
          toast.dismiss(loadingToast);
          toast.error(err);
        });
    }
    console.log(img);
  };

  const handleError = (e) => {
    let img = e.target;
    img.src = bannerImg;
  };

  //   this function handles all the key press events
  const handleTitleKeyDown = (e) => {
    if (e.keyCode == 13) {
      // if user press enter then we prevent this bcz title is only continuous form accepeted
      e.preventDefault();
    }
  };

  //  this function handle height changes when type blog title
  const handleTitleChange = (e) => {
    let input = e.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
    setBlog({ ...blog, title: input.value });
  };

  // this function handle all publish events when a user click on publish button on the top
  const handlePublishEvent = () => {
    if (!banner.length) {
      return toast.error("Upload Banner to publish blog");
    }

    if (!title.length) {
      return toast.error("Write Blog Title to Public Blog");
    }

    if (textEditor.isReady) {
      textEditor
        .save()
        .then((data) => {
          if (data.blocks.length) {
            setBlog({ ...blog, content: data });
            setEditorState("publish");
          } else {
            return toast.error("Write something in your blog to publish it");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handleSvaeDraft = (e) => {
    if (e.target.className.includes("disable")) {
      return;
    }

    if (!title.length) {
      return toast.error("Write blog title before saving it as a draft");
    }

    let loading = toast.loading("Saving Draft...");

    e.target.classList.add("disable");

    if(textEditor.isReady){
      textEditor.save().then((content)=>{
        let blogObj = { title, banner, des, tags, content, draft: true };

        axios
        .post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", blogObj, {
          headers: {
            Authorization: `Bearer ${auth_token}`,
          },
        })
        .then(() => {
          e.target.classList.remove("disable");
          toast.dismiss(loading);
          toast.success("Saved 👍");
  
          setTimeout(() => {
            navigate("/");
          }, 500);
        })
        .catch(({ response }) => {
          e.target.classList.remove("disable");
          toast.dismiss(loading);
          toast.error(response.data.error);
        });
        
      })
    }

   
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="flex-none w-10">
          <img src={logo} />
        </Link>
        <p className="max-md:hidden line-clamp-1 w-full text-black">
          {title.length ? title : "New Blog"}
        </p>

        <div className="flex gap-4 ml-auto">
          <button className="btn-dark py-2" onClick={handlePublishEvent}>
            Publish
          </button>
          <button className="btn-light py-2" onClick={handleSvaeDraft}>
            Save Draft
          </button>
        </div>
      </nav>
      <Toaster />
      <AnimationWrap>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            {/* this div is take care of blog image banner area */}
            <div className="relative aspect-video bg-white hover:opacity-80 border-4 border-grey">
              <label htmlFor="uploadBanner">
                <img
                  src={banner}
                  alt=""
                  onError={handleError}
                  className="z-20"
                />
                <input
                  id="uploadBanner"
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>

            {/* this textarea is all about blog title section */}
            <textarea
              defaultValue={title}
              placeholder="Blog Title"
              className="text-4xl font-medium resize-none w-full h-20 outline-none leading-tight                
               placeholder:opacity-40 mt-10"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>

            <hr className="w-full opacity-10 my-5" />
            <div id="textEditor" className="font-gelasio"></div>
          </div>
        </section>
      </AnimationWrap>
    </>
  );
};

export default BlogEditor;
