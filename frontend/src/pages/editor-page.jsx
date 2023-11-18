import { createContext, useContext, useState } from "react";
import { UserContext } from "../App";
import { Navigate } from "react-router-dom";
import BlogEditor from "../components/blog-editor-comp";
import PublishForm from "../components/publish-form-comp";


const blogStructure = {
    title: '',
    banner: '',
    content: [],
    tags: [],
    des: '',
    author: { presonal_info: {} }
}

export const EditorContext = createContext({});

const Editor = () => {
    const [blog, setBlog] = useState(blogStructure);

    let { userAuth: { auth_token }, setUserAuth } = useContext(UserContext);

    const [editorState, setEditorState] = useState("publish");

    const [textEditor, setTextEditor] = useState({isReady : false});

    return (
        <EditorContext.Provider value={{blog , setBlog, editorState, setEditorState, textEditor, setTextEditor}}>
            {
                // check weather user has signed in or not if not then redirect to signin page
                auth_token === null ? <Navigate to='/signin' />
                    :
                    editorState == "editor" ? <BlogEditor /> : <PublishForm />
            }
        </EditorContext.Provider>

    )
}

export default Editor;