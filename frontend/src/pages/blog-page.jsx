import axios from "axios"
import { createContext, useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import AnimationWrap from '../common/page-animation'
import Loader from "../components/loader-comp";
import { getDay } from "../common/date";
import BlogInteraction from "../components/blog-interaction.component";
import BlogPostCard from "../components/blog-post-comp";
import BlogContent from "../components/blog-content-comp";

export const blogStructure = {
    title: '',
    des: '',
    content: [],
    bannet: '',
    author: { personal_info: {} },
    publishedAt: ''
}

export const BlogContext = createContext({});

const BlogPage = () => {

    let { blog_id } = useParams()
    let [blog, setBlog] = useState(blogStructure)
    let [loading, setLoading] = useState(true)
    let [similarBlogs , setSimilarBlogs] = useState(null)
    let { title, content, banner, author: { personal_info: { fullname, username: author_username, profile_img } }, publishedAt } = blog;

    // fetch blog data from the backend
    const fetchBlog = () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/get-blog', { blog_id })
            .then(({ data: { blog } }) => {

                axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/search-blogs', {tag : blog.tags[0], limit : 6, eliminate_blog:blog_id})
                .then(({data}) =>{
                    setSimilarBlogs(data.blogs)
                })
                setBlog(blog)
                // console.log(blog);
                setLoading(false)
            })
            .catch(err => {
                console.log(err);
                setLoading(false)
            })
    }

    useEffect(() => {
        resetStates();
        fetchBlog();
    }, [blog_id])

    // reseting the states 
    const resetStates = () =>{
        setBlog(blogStructure);
        setLoading(true);
        setSimilarBlogs(null)
    }

    return (
        <AnimationWrap>
            {
                loading
                    ?
                    <Loader />
                    :
                    <BlogContext.Provider value={{blog, setBlog}}>

                        <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">
                            <img src={banner} alt="" className="aspect-video" />
                            <div className="mt-12">
                                <h2>{title}</h2>
                                <div className="flex max-sm:flex-col justify-between my-8 ">
                                    <div className="flex gap-5 items-start">
                                        <img src={profile_img} alt="" className="w-12 h-12 rounded-full" />
                                        <p className="capitalize">
                                            {fullname}
                                            <br />
                                            @
                                            <Link to={`/user/${author_username}`} className="underline">{author_username}</Link>
                                        </p>
                                    </div>

                                    <p className="text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">Published on {getDay(publishedAt)}</p>
                                </div>
                            </div>

                            <BlogInteraction />

                            {/* Blog content will go over here */}
                            {
                                content[0].blocks.map((block, i) => {
                                    return <div key={i} className="my-4 md:my-8">
                                        <BlogContent block ={block}/>
                                    </div>
                                })
                            }
                            <BlogInteraction />

                            {
                                similarBlogs !== null && similarBlogs.length ?
                                <>
                                <h1 className="text-2xl mt-14 mb-10 font--medium">
                                    Similar Blogs
                                </h1>

                                {
                                    similarBlogs.map((blog, i)=>{
                                        let {author :{personal_info}} = blog;

                                        return <AnimationWrap key={i} transition={{duration:1, delay : i*0.08}}>
                                            <BlogPostCard content={blog} author={personal_info}/>
                                        </AnimationWrap>
                                    })
                                }
                                </>
                                :""
                            }

                        </div>
                    </BlogContext.Provider>

            }
        </AnimationWrap>
    )
}

export default BlogPage