// importing tools for our editor 

import Embed from '@editorjs/embed'
import List from '@editorjs/list'
import Image from '@editorjs/image'
import Header from '@editorjs/header'
import Quote from '@editorjs/quote'
import Marker from '@editorjs/marker'
import InlineCode from '@editorjs/inline-code'
// import Link from '@editorjs/link'
import { uploadImage } from '../common/aws'

// funtion to upload images by link
const uploadImgByUrl = async (e) => {
    let link = new Promise((resolve , reject) => {
        try {
            resolve(e);
        } catch (error) {
            reject(error)
        }
    })

    const url = await link
    return {
        success: 1,
        file: { url }
    }
}

// function to handle images upload by file
const uploadImgByFile = async (e) => {
    const url = await uploadImage(e)
    if (url) {
        return {
            success: 1,
            file: { url }
        }
    }
}

export const tools = {
    embed: Embed,
    list: {
        class: List,
        inlineTollBar: true
    },
    image: {
        class: Image,
        config: {
            uploader: {
                uploadByUrl: uploadImgByUrl,
                uploadByFile: uploadImgByFile
            }
        }
    },
    header: {
        class: Header,
        config: {
            placeholder: "Type Heading...",
            levels: [2, 3],
            defaultLevel: 2
        }
    },
    quote: {
        class: Quote,
        inlineToolBar: true
    },
    marker: Marker,
    inlineCode: InlineCode
}
