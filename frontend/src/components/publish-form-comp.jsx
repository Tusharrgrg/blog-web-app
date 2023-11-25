import toast, { Toaster } from "react-hot-toast";
import AnimationWrap from "../common/page-animation";
import { useContext } from "react";
import { EditorContext } from "../pages/editor-page";
import Tag from "./tags-comp";
import axios from "axios";
import { UserContext } from "../App";
import { useNavigate } from "react-router-dom";

const PublishForm = () => {

    let characterLimit = 200;
    let tagLimit = 10;

    let navigate = useNavigate();

    let {userAuth :{auth_token} } = useContext(UserContext);
    // Use context from editor-page 
    let {
        blog: { banner, title, tags, des, content},
        setEditorState,
        setBlog,
        blog,
    } = useContext(EditorContext);

    // handle the event when we press close button on publish blog page
    const handleCloseEvent = () => {
        setEditorState("editor");
    };

    // handle the title change when we update title from the input form
    const handleTitleChange = (e) => {
        let input = e.target;
        setBlog({ ...blog, title: input.value });
    };

    // handle the Descripton change when we update Description from the input form
    const handleDescriptionChange = (e) => {
        let input = e.target;
        setBlog({ ...blog, des: input.value })
    }


    //   this function handles all the key press events 
    const handleKeyDown = (e) => {
        if (e.keyCode == 13) { // if user press enter then we prevent this bcz title is only continuous form accepeted
            e.preventDefault();
        }
    }

    // handle the tags when we enter tags in topic input form
    const handleTagKeyDown = (e) => {

        if (e.keyCode == 13 || e.keyCode == 188) { // 188 keyCode for ',' and 13 keyCode for 'enter' key
            e.preventDefault();

            let tag = e.target.value;

            if (tags.length < tagLimit) {
                if (!tags.includes(tag) && tag.length) {
                    setBlog({ ...blog, tags: [...tags, tag] })
                }
            } else {
                toast.error(`You can add max ${tagLimit} tags`)
            }
            e.target.value = "";
        }

    }

    const publishBlog = (e) => {

        if (e.target.className.includes('disable')) {
            return;
        }

        if (!title.length) {
            return toast.error("Write blog title before publishing it")
        }

        if (!des.length || des.length > characterLimit) {
            return toast.error(`write description about your blog within ${characterLimit} characters to publish`)
        }

        if (!tags.length) {
            return toast.error("Enter at least 1 tag to help us rank your blog")
        }

        let loading = toast.loading("Publishing...")

        e.target.classList.add('disable')

        let blogObj = {title, banner, des, tags, content, draft:false };

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/create-blog', blogObj, {
            headers : {
                'Authorization' : `Bearer ${auth_token}`
            }
        }).then(()=>{
            e.target.classList.remove("disable")
            toast.dismiss(loading)
            toast.success("Published 👍")

            setTimeout(()=>{
                navigate('/');
            }, 500)
        }).catch(({response})=>{
            e.target.classList.remove("disable");
            toast.dismiss(loading);
            toast.error(response.data.error);
        })
    }

    return (
        <AnimationWrap>
            <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
                <Toaster />
                {/* close button which takes you to editor page back */}
                <button
                    className="w-12 h-12 absolute right-[5vw] top-[5%] lg:top-[10%] z-10"
                    onClick={handleCloseEvent}
                >
                    <i className="fi fi-br-cross"></i>
                </button>

                <div className="max-w-[550px] center">
                    <p className="text-dark-grey mb-1">Preview</p>
                    <div className="w-full aspect-video overflow-hidden bg-grey mt-4 rounded-lg">
                        <img src={banner} alt="Blog Banner" />
                    </div>
                    <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2">
                        {title}
                    </h1>
                    <p className="font-gelasio line-clamp-2 text-xl leading-7 mt-4">
                        {des}
                    </p>
                </div>

                <div className="border-grey lg:border-1 lg:pl-8">
                    <p className="text-dark-grey mb-2 mt-9">Blog Title</p>
                    <input
                        type="text"
                        placeholder="Blog Title"
                        defaultValue={title}
                        className="input-box pl-4"
                        onChange={handleTitleChange}
                    />

                    <p className="text-dark-grey mb-2 mt-9">
                        Short description about your blog
                    </p>
                    <textarea
                        maxLength={characterLimit}
                        defaultValue={des}
                        className="h-40 resize-none leading-7 input-box pl-4"
                        onChange={handleDescriptionChange}
                        onKeyDown={handleKeyDown}
                    >
                    </textarea>

                    <p className="mt-1 text-dark-grey text-sm text-right">{characterLimit - des.length} characters left</p>

                    <p className="text-dark-grey mb-2 mt-9">Topics - ( Helps in searching and ranking you blog )</p>
                    <div className="relative input-box pb-4 pl-2 py-2">
                        <input
                            type="text"
                            placeholder="Topics"
                            className="input-box left-0 top-0 sticky bg-white pl-4 mb-3 focus:bg-white"
                            onKeyDown={handleTagKeyDown}
                        />

                        {
                            tags.map((tag, i) => {
                                return <Tag tag={tag} tagIndex={i} key={i} />
                            })
                        }
                    </div>

                    <p className="mt-1 text-dark-grey text-sm text-right">{tagLimit - tags.length} Tags left</p>

                    <button className="btn-dark px-8" onClick={publishBlog}>Publish</button>
                </div>
            </section>
        </AnimationWrap>
    );
};

export default PublishForm;
