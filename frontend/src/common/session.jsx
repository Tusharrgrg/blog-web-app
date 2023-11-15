const storeSession = (key, value) =>{
    return sessionStorage.setItem(key, value);
}

const lookSession = (key)=>{
    return sessionStorage.getItem(key);
}

const removeSession = (key) =>{
    return sessionStorage.removeItem(key);
}

export {storeSession, lookSession, removeSession}