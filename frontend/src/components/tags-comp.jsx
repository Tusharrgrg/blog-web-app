import { useContext } from "react";
import { EditorContext } from "../pages/editor-page";

const Tag = ({ tag, tagIndex }) => {

    let {blog :{tags}, setBlog} = useContext(EditorContext);

    const handleTagDelete = () => {
        tags = tags.filter(t => t!== tag);
        setBlog({...blog, tags})
    }


    // Handle Tag edit events 
    const handleTagEdit = (e) => {
        if(e.keyCode == 13 || e.keyCode == 188){ // 188 keyCode for ',' and 13 keyCode for 'enter' key
            e.preventDefault();

            let currentTag = e.target.innerText;

            tags[tagIndex] = currentTag;

            setBlog({...blog, tags});

            e.target.setAttribute("contentEditable", false);
        }
    }

    const addEditable = (e) => {
        e.target.setAttribute("contentEditable", true);
        e.target.focus();
    }


    return (
        <div className="relative bg-white p-2 px-5 mt-2 mr-2 rounded-full inline-block hover:bg-opacity-50 pr-10">
            <p className="outline-none" onKeyDown={handleTagEdit} onClick={addEditable} contentEditable='true'>{tag}</p>
            <button className="mt-[2px] rounded-full absolute right-3 top-1/2 -translate-y-1/2" onClick={handleTagDelete}>
                <i className="fi fi-br-cross text-sm pointer-events-none"></i>
            </button>
        </div>
    )
}

export default Tag;