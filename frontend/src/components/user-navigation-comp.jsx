import { useContext } from "react"
import AnimationWrap from "../common/page-animation"
import { Link } from 'react-router-dom'
import { UserContext } from '../App';
import { removeSession } from "../common/session";

const UserNavigation = () => {

    const {userAuth : {username}, setUserAuth} = useContext(UserContext)

    const userSignOut = () =>{
        console.log('User is signing out...');
        removeSession('user');
        setUserAuth({auth_token : null})
    }

    return (
        <AnimationWrap transition={{ duration: 0.2 }} className="absolute right-0 z-50">
            <div className="bg-white right-0 absolute border border-grey w-60 duration-200">
                <Link to='/editor' className="flex gap-2 md:hidden link pl-8 py-4">
                    <i className="fi fi-rr-file-edit"></i>
                    <p>Write</p>
                </Link>

                <Link to={`/user/${username}`} className="link pl-8 py-4">
                    Profile
                </Link>

                <Link to={'/dashboard/blogs'} className="link pl-8 py-4">
                    Dashboard
                </Link>

                <Link to={'/settings/edit-profile'} className="link pl-8 py-4">
                    Settings
                </Link>

                <span className="absolute w-[100%] border-t border-grey"></span>

                <button className="text-left p-4 hover:bg-grey w-full pl-8 py-4" onClick = {userSignOut}>
                    <h1 className="font-bold text-xl mg-1">Sign Out</h1> 
                    <p className="text-dark-grey">@{username}</p>
                </button>
            </div>
        </AnimationWrap>
    )
}

export default UserNavigation;