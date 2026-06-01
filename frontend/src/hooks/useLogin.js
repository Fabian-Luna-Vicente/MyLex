import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export function useLogin() {
  const { loginWithGoogle, loginWithEmail, registerUser, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    if (isRegistering) {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill all fields');
        setLoading(false);
        return;
      }
      const result = await registerUser(formData.email, formData.name, formData.password);
      if (result.success) {
        setSuccessMsg(result.message);
        setIsRegistering(false);
        setFormData({ ...formData, password: '' });
      } else {
        setError(result.message);
      }
    } else {
      if (!formData.email || !formData.password) {
        setError('Please enter email and password');
        setLoading(false);
        return;
      }
      const result = await loginWithEmail(formData.email, formData.password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    }
    setLoading(false);
  };

  const handleFakeGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const fakeToken = "test_token";

    const result = await loginWithGoogle(fakeToken);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return {
    user,
    authLoading,
    navigate,
    isRegistering,
    setIsRegistering,
    loading,
    error,
    setError,
    successMsg,
    setSuccessMsg,
    formData,
    handleChange,
    handleEmailSubmit,
    handleFakeGoogleLogin
  };
}
