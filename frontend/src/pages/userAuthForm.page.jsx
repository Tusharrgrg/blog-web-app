import { useContext, useRef } from "react";
import AnimationWrap from "../common/page-animation";
import InputBox from "../components/input-comp";
import googleIcon from "../imgs/google.png";
import { Link, Navigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { storeSession } from "../common/session";
import { UserContext } from "../App";
import { authGoogle } from "../common/firebase";

const UserAuthForm = ({ type }) => {
    let {
        userAuth: { auth_token },
        setUserAuth,
    } = useContext(UserContext);
    console.log(auth_token);

    const userAuthServer = (serverRoute, formData) => {
        console.log(formData)
        axios
            .post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
            .then(({ data }) => {
                console.log(data)
                storeSession("user", JSON.stringify(data));
                setUserAuth(data);
            })
            .catch(({ response }) => {
                return toast.error(response.data.error);
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let serverRoute = type === "sign-in" ? "/signin" : "/signup";

        let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
        let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

        let form = new FormData(formElement);
        let formData = {};

        for (let [key, value] of form.entries()) {
            formData[key] = value;
        }
        // console.log(formData)

        let { fullname, email, password } = formData;
        if (fullname) {
            if (fullname.length < 3) {
                return toast.error("Full Name must be at least 3 letters long");
            }
        }
        if (!email.length) {
            return toast.error("Enter email");
        }
        if (!emailRegex.test(email)) {
            return toast.error("Email is invalid");
        }
        if (!passwordRegex.test(password)) {
            return toast.error(
                "password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters"
            );
        }

        userAuthServer(serverRoute, formData);
    };

    const handleGoogleAuth = (e) => {
        e.preventDefault();
        authGoogle()
            .then((user)=>{
                let srverRoute = '/google-auth';
                let formData = {
                    auth_token : user.accessToken
                }
                userAuthServer(srverRoute, formData)
            })
            .catch((err)=>{
                toast.error("trouble in login through google")
                return console.log(err);
            });
    };

    return auth_token ? (
        <Navigate to="/" />
    ) : (
        <AnimationWrap keyValue={type}>
            <section className="h-cover flex items-center justify-center">
                <Toaster />
                <form id="formElement" action="" className="w-[80%] max-w-[400px]">
                    <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
                        {type === "sign-in" ? "Welcome Back" : "Join Us Today"}
                    </h1>

                    {type !== "sign-in" ? (
                        <InputBox
                            name="fullname"
                            type="text"
                            placeholder="Full Name"
                            icon="fi-rr-user"
                        />
                    ) : (
                        ""
                    )}
                    <InputBox
                        name="email"
                        type="email"
                        placeholder="Email"
                        icon="fi-rr-envelope"
                    />
                    <InputBox
                        name="password"
                        type="password"
                        placeholder="Password"
                        icon="fi-rr-key"
                    />

                    <button
                        className="btn-dark center mt-14"
                        type="submit"
                        onClick={handleSubmit}
                    >
                        {type.replace("-", " ")}
                    </button>

                    <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
                        <hr className="w-1/2 border-black" />
                        <p>Or</p>
                        <hr className="w-1/2 border-black" />
                    </div>

                    <button
                        className="btn-dark flex items-center justify-center gap-4 w-[90%] center"
                        onClick={handleGoogleAuth}
                    >
                        <img src={googleIcon} className="w-5" />
                        continue with google
                    </button>

                    {type === "sign-in" ? (
                        <p className="mt-6 text-dark-grey text-xl text-center">
                            Don't have an account ?
                            <Link to="/signup" className="underline text-black text-xl ml-1">
                                Join us today
                            </Link>
                        </p>
                    ) : (
                        <p className="mt-6 text-dark-grey text-xl text-center">
                            Already a member ?
                            <Link to="/signin" className="underline text-black text-xl ml-1">
                                sign in here
                            </Link>
                        </p>
                    )}
                </form>
            </section>
        </AnimationWrap>
    );
};

export default UserAuthForm;
