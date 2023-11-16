import { useState } from "react";

const InputBox = ({ name, id, type, value, placeholder, icon }) => {

    const [passVisible, setPassVisible] = useState(false);

    return (
        <div className="relative w-[100%] mb-4">
            <input
                type={type === 'password' ? passVisible ? 'text' : "password" : type}
                name={name}
                defaultValue={value}
                placeholder={placeholder}
                className="input-box"
            />
            <i className={"fi " +icon+ " input-icon"}></i>

            {
                type === "password" ?
                <i className={"fi fi-rr-eye"+ (!passVisible ? "-crossed" : "") + " input-icon left-[auto] right-4 cursor-pointer"}
                onClick={()=> setPassVisible((currentValue) => !currentValue)}></i>
                : ""
            }
        </div>
    );
};

export default InputBox;
