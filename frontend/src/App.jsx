import { Route, Routes, json } from "react-router-dom";
import Navbar from "./components/navbar.component";
import UserAuthForm from './pages/userAuthForm.page';
import { createContext, useEffect, useState } from "react";
import { lookSession } from "./common/session";

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
                <Route path="/" element={<Navbar />}>
                    <Route path="signin" element={<UserAuthForm type="sign-in" />} />
                    <Route path="signup" element={<UserAuthForm type="sign-up" />} />
                </Route>
            </Routes>
        </UserContext.Provider>
    )
}

export default App;