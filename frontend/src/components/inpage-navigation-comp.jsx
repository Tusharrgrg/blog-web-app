import { useEffect, useRef, useState } from "react";

export let activeTabLineRef;
export let activeTab;

const InPageNavigation = ({ routes, defaultHidden=[],defaultActiveIndex = 0, children}) => {

    const [inPageNavIndex, setInPageNavIndex] = useState(defaultActiveIndex);

     activeTabLineRef = useRef();
     activeTab = useRef();

    // function to change state of the page
    const changePageState = (btn, i) => {
        let { offsetWidth, offsetLeft } = btn
        activeTabLineRef.current.style.width = offsetWidth + "px";
        activeTabLineRef.current.style.left = offsetLeft + "px";
        setInPageNavIndex(i);
    }

    useEffect(()=>{
        changePageState(activeTab.current, defaultActiveIndex);
    },[])

    return (
        <>
            {/* div for tabs in home page like inpage tabs for navigation */}
            <div className="relative mb-8 border-b bg-white border-grey fles flex-nowrap overflow-x-auto">
                {routes.map((route, i) => {
                    return (
                        <button
                            ref={i === defaultActiveIndex ? activeTab : null}
                            key={i}
                            className={"p-4 px-5 capitalize " + (inPageNavIndex == i ? "text-black" : "text-dark-grey ")+(defaultHidden.includes(route) ? " md:hidden ":"")}
                            onClick={(e) => { changePageState(e.target, i) }}>
                            {route}
                        </button>
                    );
                })}

                <hr ref={activeTabLineRef} className="absolute bottom-0 duration-300" />
            </div>

            {
                Array.isArray(children) ? children[inPageNavIndex] : children
            }
        </>
    );
};

export default InPageNavigation;
