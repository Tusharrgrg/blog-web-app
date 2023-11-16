import { Link } from "react-router-dom";
import logo from '../imgs/ishare-favicon-black.png'
import AnimationWrap from "../common/page-animation";
import banner from '../imgs/blog banner.png'
import { uploadImage } from "../common/aws";
import { useRef } from "react";
import toast, { Toaster } from "react-hot-toast";

const BlogEditor = () => {

    const blogBannerRef = useRef();

    const handleBannerUpload =(e) =>{
        let img = e.target.files[0];
        if(img){
            let loadingToast = toast.loading("Uploading...");
            uploadImage(img).then((url)=>{
                if(url){
                    toast.dismiss(loadingToast);
                    toast.success("Uploaded👍")
                    blogBannerRef.current.src = url
                }
            }).catch(err =>{
                toast.dismiss(loadingToast);
                toast.error(err);
            })
        }
        console.log(img)
    }


    return (
        <>
            <nav className="navbar">
                <Link to='/' className="flex-none w-10">
                    <img src={logo} />
                </Link>
                <p className="max-md:hidden line-clamp-1 w-full text-black">
                    New Blogs
                </p>

                <div className="flex gap-4 ml-auto">
                    <button className="btn-dark py-2">
                        Publish
                    </button>
                    <button className="btn-light py-2">
                        Save Draft
                    </button>
                </div>
            </nav>
            <Toaster/>
            <AnimationWrap>
                <section>
                    <div className="mx-auto max-w-[900px] w-full">
                        <div className="relative aspect-video bg-white hover:opacity-80 border-4 border-grey">
                            <label htmlFor="uploadBanner">
                                <img ref={blogBannerRef} src={banner} alt="" />
                                <input
                                    id="uploadBanner"
                                    type="file"
                                    accept=".png, .jpg, .jpeg"
                                    hidden
                                    onChange={handleBannerUpload}
                                />
                            </label>

                        </div>
                    </div>
                </section>
            </AnimationWrap>
        </>
    )
}

export default BlogEditor