import { useEffect, useState } from "react";
import AnimationWrap from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation-comp";
import axios from 'axios'
import Loader from '../components/loader-comp'
import BlogPostCard from "../components/blog-post-comp";
import MinimalBlogPost from "../components/nobanner-blog-post-comp";
import { activeTabLineRef, activeTab } from "../components/inpage-navigation-comp";
import NoDataMessage from "../components/nodata-comp";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more-comp";

const HomePage = () => {

    const [blogs, setBlogs] = useState(null);
    const [trendingBlogs, setTrendingBlogs] = useState(null);
    const [pageState, setPageState] = useState("home")

    let categories = ["programming", "tech", "travel", "food", "finances", "hollywood", "social media"];

    // function to fetch latest blogs from the backend
    const fetchLatestBlogs = ({page = 1}) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/latest-blogs', { page })
            .then(async ({ data }) => {
                // console.log(data.blogs);
                let formatedData = await filterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    countRoute: '/all-latest-blogs-count'
                })
                // console.log(formatedData);
                setBlogs(formatedData);
            }).catch(err => {
                console.log(err);
            })
    }

    // function to fetch Trending blogs from the backend
    const fetchTrendingBlogs = () => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + '/trending-blogs')
            .then(({ data }) => {
                // console.log(data.blogs);
                setTrendingBlogs(data.blogs);
            }).catch(err => {
                console.log(err);
            })
    }

    // Fetch blogs by category from dtabase
    const fetchBlogsByCategory = ({page = 1}) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/search-blogs', { tag: pageState, page})
            .then(async({ data }) => {
                let formatedData = await filterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    countRoute: '/search-blogs-count',
                    data_to_send :{tag:pageState}
                })
                // console.log(formatedData);
                setBlogs(formatedData);
            }).catch(err => {
                console.log(err);
            })
    }

    // Load blogs by particular category
    const loadBlogByCategory = (e) => {
        let category = e.target.innerText.toLowerCase();
        setBlogs(null)

        if (pageState == category) {
            setPageState("home")
            return
        }
        setPageState(category)
    }

    // useEffect hook for rendering
    useEffect(() => {
        activeTab.current.click();

        if (pageState == "home") {
            fetchLatestBlogs({page:1});
        } else {
            fetchBlogsByCategory({page:1});
        }
        if (trendingBlogs == null) {
            fetchTrendingBlogs()
        }
    }, [pageState])

    return (
        <AnimationWrap>
            <section className="h-cover flex justify-center gap-10">
                {/* Div for latest blogs */}
                <div className="w-full">

                    <InPageNavigation routes={[pageState, "trending blogs"]} defaultHidden={["trending blogs"]} children>
                        <>
                            {
                                blogs == null ? (<Loader />) : (
                                    blogs.results.length ?
                                        blogs.results.map((blog, i) => {
                                            return (
                                                <AnimationWrap key={i}
                                                    transition={{ duration: 1, delay: i * -1 }}>
                                                    <BlogPostCard content={blog} author={blog.author.personal_info} />
                                                </AnimationWrap>
                                            );
                                        })
                                        : <NoDataMessage message="No Blogs Publish" />
                                )}

                                <LoadMoreDataBtn state ={blogs} fetchDataFun={(pageState == "home"?fetchLatestBlogs:fetchBlogsByCategory)}/>
                        </>
                        {
                            trendingBlogs == null ? (<Loader />) : (
                                trendingBlogs.length ?
                                    trendingBlogs.map((blog, i) => {
                                        return (
                                            <AnimationWrap key={i} transition={{ duration: 1, delay: i * -1 }}>
                                                <MinimalBlogPost blog={blog} index={i} />
                                            </AnimationWrap>)
                                    })
                                    : <NoDataMessage message="No Trending Blogs" />
                            )}
                    </InPageNavigation>
                </div>

                {/* Div for filters and trending blogs */}
                <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-1 border-grey pl-8 pt-3 max-md:hidden">
                    <div className="flex gap-10 flex-col">
                        <div>
                            <h1 className="font-medium text-xl mb-8">
                                Stories from all interest
                            </h1>
                            <div className="flex gap-3 flex-wrap">
                                {
                                    categories.map((category, i) => {
                                        return <button key={i} className={"tag " + (pageState == category ? "bg-black text-white" : "")} onClick={loadBlogByCategory}>
                                            {category}
                                        </button>
                                    })
                                }
                            </div>
                        </div>

                        <div>
                            <h1 className="font-medium text-xl mb-8">
                                Trending <i className="fi fi-rr-arrow-trend-up"></i>
                            </h1>

                            {
                                trendingBlogs == null ? (<Loader />) :
                                    (
                                        trendingBlogs.length ?
                                            trendingBlogs.map((blog, i) => {
                                                return (
                                                    <AnimationWrap key={i} transition={{ duration: 1, delay: i * -1 }}>
                                                        <MinimalBlogPost blog={blog} index={i} />
                                                    </AnimationWrap>
                                                )
                                            })
                                            : <NoDataMessage message="No Trending Blogs" />
                                    )
                            }
                        </div>
                    </div>
                </div>
            </section>
        </AnimationWrap>
    )
}

export default HomePage;