import { useContext, useState } from 'react'
import logo from '../imgs/full-logo.png'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { UserContext } from '../App';

import UserNavigation from './user-navigation-comp'

const Navbar = () => {

    const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
    const { userAuth, userAuth: { auth_token, profile_img } } = useContext(UserContext);
    const [userPanel, setUserPanel] = useState(false);

    let navigate = useNavigate();

    const handleUserPanel = () => {
        setUserPanel(currentVal => !currentVal);
    }

    const handleBlur = () => {
        setTimeout(() => {
            setUserPanel(false);
        }, 1000);
    }

    // handle search inputs 
    const handleSearch =(e) =>{
        let query = e.target.value;
        // console.log(e)
        if(e.keyCode === 13  && query.length){
            navigate(`/search/${query}`);
        }
    }
    return (
        <>
            <nav className="navbar">
                <Link to='/' className='flex-none w-20'>
                    <img src={logo} alt="" className='w-full' />
                </Link>

                {/* div for search box */}
                <div className={'absolute bg-white w-full left-0 top-full mt-0.5 border-b border-grey py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto md:show ' + (searchBoxVisibility ? 'show' : 'hide')}>
                    <input
                        type="text"
                        placeholder='search'
                        className='w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full palceholder:text-dark-grey md:pl-12'
                        onKeyDown={handleSearch}
                    />
                    <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
                </div>

                {/* Search box visibility for small screens */}
                <div className='flex items-center gap-3 md:gap-6 ml-auto'>
                    <button className='md:hidden bg-grey w-12 h-12 rounded-full flex items-center justify-center'
                        onClick={() => setSearchBoxVisibility(currentVal => !currentVal)}>
                        <i className="fi fi-rr-search text-xl"></i>
                    </button>

                    <Link to='/editor' className='hidden md:flex gap-2 link'>
                        <i className="fi fi-rr-file-edit"></i>
                        <p>Write</p>
                    </Link>

                    {
                        auth_token ?
                            <>
                                {/* Notification icon button */}
                                <Link to='/dashboard/notification'>
                                    <button className='w-12 h-12 rounded-full bg-grey relative hover:bg-black/10'>
                                        <i className='fi fi-rr-bell text-2xl mt-1 block'></i>
                                    </button>
                                </Link>
                                {/* User profile button */}
                                <div className='relative' onClick={handleUserPanel} onBlur={handleBlur}>
                                    <button className='w-12 h-12 mt-1'>
                                        <img src={profile_img} alt="user_profile" className='w-full h-full object-cover rounded-full' />
                                    </button>

                                    {
                                        userPanel ? <UserNavigation /> : ""
                                    }

                                </div>
                            </>
                            :
                            <>
                                {/* Signin & Signup Button */}
                                <Link to='/signin' className='btn-dark py-2'>
                                    Sign in
                                </Link>
                                <Link to='/signup' className='btn-light py-2 hidden md:block'>
                                    sign up
                                </Link>

                            </>
                    }
                </div>
            </nav>
            {/* help to navigate route if there is nested routes */}
            <Outlet />
        </>
    )
}

export default Navbar;