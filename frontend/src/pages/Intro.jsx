import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/intro.css';
export default function Intro(){
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate=useNavigate();
//     const handleStart = () => {
//     navigate('');

   
//   }
   const handleLogin = (e) => {
        e.preventDefault();
        console.log("connexion avec :", email , password);
        
    };
    return(
    <div className='bigbody'>
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
        </div>

        <div className="Logincontainer">
            <h1 className='login'>Login</h1>
            <form>
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                <a href="#" className='forgot-password'>Forgot Password?</a>
                <button type="submit">LOGIN</button>
                <p>
                    Don't have an account? <a href="/signup">Sign up</a>
                </p>
            </form>
        </div>
    </div>
         

        
        
    )
}