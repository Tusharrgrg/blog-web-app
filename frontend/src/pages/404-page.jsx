import pageNotFoundImg from '../imgs/404.png'
import {Link} from 'react-router-dom'
import fullLogo from '../imgs/full-logo.png'

const PageNotFound = () =>{
    return (
        <section className="h-cover relative p-10 flex flex-col items-center gap-20">
            <img src={pageNotFoundImg} alt="" className='select-none border-2 border-grey w-72 aspect-square object-cover rounded'/>
            <h1 className='text-4xl font-gelasio leading-7'>Page Not Found</h1>
            <p className='text-dark-grey -mt-8 text-xl leading-7'>The page you are looking for does not exist. Head back to the <Link to='/' className='text-black underline'> Home page </Link></p>
            <div className='mt-auto'>
                <img src={fullLogo} alt="" className='h-8 object-contain block mx-auto select-none'/>
                <p className='mt-5 teaxt-dark-grey'>Read millions of stories around the world</p>
            </div>
        </section>
    )
}

export default PageNotFound;