import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RecuperarPassword() {
    const navigate = useNavigate();
    useEffect(() => { navigate('/iniciar-sesion', { replace: true }); }, [navigate]);
    return null;
}
