import { useParams } from "react-router-dom";
import InPageNavigation from "../components/inpage-navigation-comp";
import NoDataMessage from "../components/nodata-comp";
import LoadMoreDataBtn from "../components/load-more-comp";
import AnimationWrap from "../common/page-animation";
import Loader from "../components/loader-comp";
import { useEffect, useState } from "react";
import axios from "axios";
import { filterPaginationData } from "../common/filter-pagination-data";
import BlogPostCard from "../components/blog-post-comp";
import UserCard from "../components/usercard-comp";

const SearchPage = () => {

    let { query } = useParams()

    const [blogs, setBlogs] = useState(null);
    const [users, setUsers] = useState(null);

    const searchBlogs = ({ page = 1, create_new_array = false }) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/search-blogs', { query, page })
            .then(async ({ data }) => {
                // console.log(data.blogs);
                let formatedData = await filterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    countRoute: '/search-blogs-count',
                    data_to_send: { query },
                    create_new_array
                })
                // console.log(formatedData);
                setBlogs(formatedData);
            }).catch(err => {
                console.log(err);
            })
    }

    const fetchUsers = () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/search-users', { query })
            .then(({ data: { users } }) => {
                setUsers(users);
            })
    }

    const resetState = () => {
        setBlogs(null)
        setUsers(null)
    }

    useEffect(() => {
        resetState();
        searchBlogs({ page: 1, create_new_array: true })
        fetchUsers()
    }, [query])


    // wrapper to dispaly users besides on blogs
    const UserCardWrapper = () => {
        return (
            <>
                {
                    users == null ? <Loader /> :
                        users.length ? users.map((user, i) => {
                            return <AnimationWrap key={i} transition={{ duration: 1, delay: i * 0.08 }}>
                                <UserCard user={user} />
                            </AnimationWrap>
                        }) :
                            <NoDataMessage message="No User Found" />
                }
            </>
        )
    }

    return (
        <section className="h-cover flex justify-center gap-10">
            <div className="w-full">
                <InPageNavigation routes={[`Search Results for "${query}"`, "Account Matched"]} defaultHidden={["Account Matched"]}>
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

                        <LoadMoreDataBtn state={blogs} fetchDataFun={(searchBlogs)} />
                    </>

                    <UserCardWrapper />
                </InPageNavigation>
            </div>

            
            <div className="min-w-[40%] lg:min-w-[350px] border-1 border-grey pl-8 pt-3 max-md:hidden">
                <h1 className="font-medium text-xl mb-8">User related to search <i className="fi fi-rr-user mt-1"></i></h1>
                <UserCardWrapper />
            </div>
        </section>
    )
}

export default SearchPage;