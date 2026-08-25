import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/intro.css';
import { CiMail } from "react-icons/ci";
import { login } from '../api';

export default function Intro() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setSubmitting(false);
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
          <button type="submit" disabled={submitting}>
            {submitting ? "CONNEXION…" : "LOGIN"}
          </button>
          <p>
            Don't have an account? <a href="/signup">Sign up</a>
          </p>
        </form>
      </div>
    </div>
  );
}
