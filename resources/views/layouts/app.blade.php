<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'SimJahit')</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        @media print {
            .no-print {
                display: none !important;
            }

            body {
                padding: 0;
                margin: 0;
            }
        }

        /* Mobile menu */
        .mobile-menu {
            display: none;
        }

        .mobile-menu.open {
            display: block;
        }

        @media (max-width: 767px) {
            .desktop-nav {
                display: none;
            }

            .mobile-menu-btn {
                display: block;
            }
        }

        @media (min-width: 768px) {
            .mobile-menu-btn {
                display: none;
            }
        }
    </style>
    @yield('styles')
</head>

<body class="bg-gray-50">
    @if(!isset($hideNav) || !$hideNav)
        <nav class="bg-blue-600 text-white no-print">
            <div class="container mx-auto px-4">
                <div class="flex justify-between items-center py-4">
                    <div class="flex items-center space-x-2">
                        <i class="fas fa-scissors text-2xl"></i>
                        <h1 class="text-xl font-bold">SimJahit</h1>
                    </div>
                    @auth
                        <div class="hidden md:flex space-x-6 desktop-nav">
                            <a href="/" class="hover:text-blue-200">
                                <i class="fas fa-home"></i> Dashboard
                            </a>
                            <a href="/" class="hover:text-blue-200">
                                <i class="fas fa-users"></i> Pelanggan
                            </a>
                            <a href="/" class="hover:text-blue-200">
                                <i class="fas fa-clipboard-list"></i> Pesanan
                            </a>
                        </div>
                        <button class="mobile-menu-btn text-white text-2xl focus:outline-none" onclick="toggleMobileMenu()"
                            aria-label="Menu">
                            <i class="fas fa-bars"></i>
                        </button>
                    @endauth
                </div>
                @auth
                    <div id="mobileMenu" class="mobile-menu pb-4 md:hidden">
                        <a href="/" class="block py-2 px-2 hover:bg-blue-700 rounded">
                            <i class="fas fa-home"></i> Dashboard
                        </a>
                        <a href="/" class="block py-2 px-2 hover:bg-blue-700 rounded">
                            <i class="fas fa-users"></i> Pelanggan
                        </a>
                        <a href="/" class="block py-2 px-2 hover:bg-blue-700 rounded">
                            <i class="fas fa-clipboard-list"></i> Pesanan
                        </a>
                    </div>
                @endauth
            </div>
        </nav>
    @endif

    <main class="container mx-auto px-4 py-8">
        @if(session('success'))
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                <i class="fas fa-check-circle"></i> {{ session('success') }}
            </div>
        @endif

        @if(session('error'))
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <i class="fas fa-exclamation-circle"></i> {{ session('error') }}
            </div>
        @endif

        @yield('content')
    </main>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script>
        function toggleMobileMenu() {
            const menu = document.getElementById('mobileMenu');
            menu.classList.toggle('open');
        }
    </script>
    @yield('scripts')
</body>

</html>