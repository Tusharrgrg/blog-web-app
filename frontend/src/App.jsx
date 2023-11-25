import { Route, Routes, json } from "react-router-dom";
import Navbar from "./components/navbar.component";
import UserAuthForm from './pages/userAuthForm.page';
import { createContext, useEffect, useState } from "react";
import { lookSession } from "./common/session";
import Editor from "./pages/editor-page";
import HomePage from "./pages/home-page";
import SearchPage from "./pages/search-page";
import PageNotFound from "./pages/404-page";
import ProfilePage from "./pages/profile-page";

export const UserContext = createContext({})

const App = () => {

    const [userAuth, setUserAuth] = useState({});

    useEffect(()=>{
        let userSession = lookSession("user");
        
        userSession ? setUserAuth(JSON.parse(userSession)): setUserAuth({auth_token : null});
    },[])

    return (
        <UserContext.Provider value={{ userAuth, setUserAuth }}>
            <Routes>
                <Route path="/editor" element ={<Editor/>}/>
                <Route path="/" element={<Navbar />}>
                    <Route  index element ={<HomePage/>}/>
                    <Route path="signin" element={<UserAuthForm type="sign-in" />} />
                    <Route path="signup" element={<UserAuthForm type="sign-up" />} />
                    <Route path="user/:id" element={<ProfilePage/>} />
                    <Route path="search/:query" element={<SearchPage/>} />
                    <Route path="*" element={<PageNotFound/>} />
                </Route>
            </Routes>
        </UserContext.Provider>
    )
}

export default App;