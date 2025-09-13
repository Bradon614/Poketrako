import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/intro.css';
import { CiMail } from "react-icons/ci";
import { login, getProfile, signup } from '../api'; // assure-toi que signup est importé

export default function Intro() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // reset error

    try {
      // 🔐 tu peux créer l'utilisateur avant de tenter le login
      await signup(email, password); 
      console.log("Utilisateur créé !");

      // ensuite login
      await login(email, password);
      const user = await getProfile();
      console.log("Connecté en tant que :", user);
      navigate("/dashboard"); // 🚀 redirection
    } catch (err) {
      console.error(err);
      setError(err.message || "Erreur inconnue");
    }
  };

  return (
    <div className='bigbody'>
      <div className="bodyIntro"> 
        <div className="nav">
          <img src="/logo.png" alt="logo Poketra" className='logo'/>
          <h2>Poketrako</h2> 
        </div>
        <div className="text">
          <h1>Welcome to Poketrako</h1>
          <p>Poketrako is a web-based financial management platform</p>
          <p>designed to help users monitor their spending and take control of their personal finances with clarity and ease.</p>
        </div>
      </div>

      <div className="Logincontainer">
        <h1 className='login'>Login</h1>
        <form onSubmit={handleSubmit}>
          <CiMail />
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
          {error && <p className="error">{error}</p>}
          <a href="#" className='forgot-password'>Forgot Password?</a>
          <button type="submit">LOGIN</button>
          <p>
            Don't have an account? <a href="/dashboard">Sign up</a>
          </p>
        </form>
      </div>
    </div>
  );
}
