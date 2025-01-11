class AuthService {
    static isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }

    static getUsername() {
        return localStorage.getItem('username') || '';
    }

    static isAdmin() {
        return localStorage.getItem('isAdmin') === 'true';
    }

    static logout() {
        localStorage.clear();
        window.location.href = 'http://localhost:8000/auth/index.html';
    }
}

export default AuthService; 