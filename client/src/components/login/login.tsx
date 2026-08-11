import { useState, type FormEvent } from 'react'
import users from '../../data/users.json'
import '../../styles/Login.css'
import miniosIcon from '../../assets/icons/settings.png'

export interface AuthUser {
    usuario: string
    rol: string
}

interface LoginProps {
    onLogin: (user: AuthUser) => void
}

interface UserRecord {
    usuario: string
    password: string
    rol: string
}

const USERS = users as UserRecord[]

export function Login({ onLogin }: LoginProps) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!username.trim() || !password.trim()) {
        setError('Ingresa usuario y contraseña')
        return
    }

    setIsSubmitting(true)

    // Simula una pequeña latencia de "autenticación"
    window.setTimeout(() => {
        const match = USERS.find(
        (user) => user.usuario === username.trim() && user.password === password,
        )

        if (match) {
        onLogin({ usuario: match.usuario, rol: match.rol })
        } else {
        setError('Usuario o contraseña incorrectos')
        setIsSubmitting(false)
        }
        }, 400)
    }

return (
    <div className="login-container">
    <div className="login-card">

        <div className="login-header">
        <div className="login-icon">
            <img src={miniosIcon} alt="MiniOS Simulator" />
        </div>

        <div className="login-title">
            <h1>MiniOS Simulator</h1>
        </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">

        <div className="input-group">
            <label htmlFor="username">
            Usuario
            </label>

            <input
            id="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Ingrese su Usuario"
        />
        </div>

        <div className="input-group">
            <label htmlFor="password">
            Contraseña
            </label>

            <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Ingrese su Contraseña"
            />
        </div>

        {error && (
            <p className="login-error">
            {error}
            </p>
        )}

        <button
            type="submit"
            disabled={isSubmitting}
            className="login-button"
        >
            {isSubmitting ? 'Verificando…' : 'Ingresar'}
        </button>

        </form>
    </div>
    </div>
)
}