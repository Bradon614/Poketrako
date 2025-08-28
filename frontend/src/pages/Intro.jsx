import { useNavigate } from 'react-router-dom';
import '../styles/intro.css';
export default function Intro(){
    const navigate=useNavigate();
    const handleStart = () => {
    navigate('/login');
  };
    return(
        
         <div className="bodyIntro"> 
            <div className="nav">
                <img src="/logo.png" alt="logo Poketra" className='logo'/>
                <h2>Poketrako</h2> 
            </div>
            <div className="text">
                <h1>Welcome to Poketrako</h1>
                <p>Poketrako is a web-based financial management platform </p>
                <p>designed to help users monitor their spending and take control of their personal finances with clarity and ease.</p>
            </div>
            <button onClick={handleStart} className='start'> Get Start ➡️ </button>
        </div>

    )
}