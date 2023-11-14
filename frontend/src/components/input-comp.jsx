const InputBox = ({ name, id, type, value, placeholder, icon }) => {
    return (
        <div className="relative w-[100%] mb-4">
            <input
                type={type}
                name={name}
                defaultValue={value}
                placeholder={placeholder}
                className="input-box"
            />
            <i className={"fi " +icon+ " input-icon"}></i>
        </div>
    );
};

export default InputBox;
