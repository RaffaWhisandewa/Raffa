// Konfigurasi Google OAuth - GANTI DENGAN CLIENT ID ANDA
        const CLIENT_ID = '1058207152144-26kjlttebhk1cgduprs50dh8b0lcqq62.apps.googleusercontent.com';
        
// State management
        let currentUser = null;

        // Parse JWT token
        function parseJwt(token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                return JSON.parse(jsonPayload);
            } catch (error) {
                console.error('Error parsing JWT:', error);
                return null;
            }
        }

        // Handle response dari Google
        function handleCredentialResponse(response) {
            try {
                console.log('Login response received');
                
                // Decode JWT token untuk mendapatkan user info
                const userObject = parseJwt(response.credential);
                
                if (!userObject) {
                    showError('Gagal membaca data pengguna');
                    return;
                }
                
                console.log('User data:', userObject);
                
                currentUser = {
                    email: userObject.email,
                    name: userObject.name,
                    picture: userObject.picture,
                    verified: userObject.email_verified
                };
                
                // Simpan ke memory (bukan localStorage)
                showDashboard();
            } catch (error) {
                showError('Gagal memproses login. Silakan coba lagi.');
                console.error('Error:', error);
            }
        }

        // Tampilkan dashboard setelah login
        function showDashboard() {
            document.getElementById('loginBox').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            
            document.getElementById('userName').textContent = currentUser.name || 'Tidak tersedia';
            document.getElementById('userEmail').textContent = currentUser.email || 'Tidak tersedia';
            document.getElementById('profileImg').src = currentUser.picture || 'https://via.placeholder.com/100';
        }

        // Tampilkan error
        function showError(message) {
            const errorDiv = document.getElementById('errorMessage');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }

        // Inisialisasi Google Sign-In
        function initializeGoogleSignIn() {
            try {
                console.log('Initializing Google Sign-In...');
                
                google.accounts.id.initialize({
                    client_id: CLIENT_ID,
                    callback: handleCredentialResponse,
                    auto_select: false,
                    cancel_on_tap_outside: true
                });
                
                console.log('Google Sign-In initialized successfully');
                
                // Render button sebagai alternatif
                google.accounts.id.renderButton(
                    document.getElementById('googleLoginBtn'),
                    { 
                        theme: 'outline', 
                        size: 'large',
                        width: '100%',
                        text: 'signin_with'
                    }
                );
                
            } catch (error) {
                console.error('Error initializing Google Sign-In:', error);
                showError('Gagal menginisialisasi Google Sign-In');
            }
        }

        // Handle login button click manual
        document.addEventListener('DOMContentLoaded', function() {
            const loginBtn = document.getElementById('googleLoginBtn');
            
            loginBtn.addEventListener('click', function(e) {
                console.log('Login button clicked');
                
                if (typeof google === 'undefined' || !google.accounts) {
                    showError('Google Sign-In belum dimuat. Silakan refresh halaman.');
                    return;
                }
                
                try {
                    google.accounts.id.prompt((notification) => {
                        console.log('Prompt notification:', notification);
                        
                        if (notification.isNotDisplayed()) {
                            showError('Pop-up login tidak dapat ditampilkan. Pastikan pop-up tidak diblokir.');
                        }
                        
                        if (notification.isSkippedMoment()) {
                            showError('Login dibatalkan atau dilewati.');
                        }
                    });
                } catch (error) {
                    console.error('Error showing prompt:', error);
                    showError('Gagal menampilkan dialog login');
                }
            });
            
            // Handle logout
            const logoutBtn = document.getElementById('logoutBtn');
            logoutBtn.addEventListener('click', function() {
                if (typeof google !== 'undefined' && google.accounts) {
                    google.accounts.id.disableAutoSelect();
                }
                
                currentUser = null;
                
                document.getElementById('loginBox').style.display = 'block';
                document.getElementById('dashboard').style.display = 'none';
                
                console.log('User logged out');
            });
        });

        // Load Google Sign-In saat halaman dimuat
        window.onload = function() {
            console.log('Window loaded');
            
            // Tunggu hingga Google library tersedia
            const checkGoogleLoaded = setInterval(function() {
                if (typeof google !== 'undefined' && google.accounts) {
                    console.log('Google library loaded');
                    clearInterval(checkGoogleLoaded);
                    initializeGoogleSignIn();
                }
            }, 100);
            
            // Timeout setelah 10 detik
            setTimeout(function() {
                clearInterval(checkGoogleLoaded);
                if (typeof google === 'undefined') {
                    showError('Gagal memuat Google Sign-In. Periksa koneksi internet Anda.');
                }
            }, 10000);
        };