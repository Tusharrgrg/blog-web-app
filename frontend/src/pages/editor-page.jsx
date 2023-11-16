import { useContext, useState } from "react";
import { UserContext } from "../App";
import { Navigate } from "react-router-dom";
import BlogEditor from "../components/blog-editor-comp";
import PublishForm from "../components/publish-form-comp";

const Editor = () => {

    let { userAuth: { auth_token }, setUserAuth } = useContext(UserContext);

    const [editorState, setEditorState] = useState("editor"); 

    return (
        // check weather user has signed in or not if not then redirect to signin page
        auth_token === null ? <Navigate />
            :
            editorState == "editor" ? <BlogEditor/> : <PublishForm/>
    )
}

export default Editor;