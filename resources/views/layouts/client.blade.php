<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta content="width=device-width, initial-scale=1.0" name="viewport">

    <title>HIM-{{ date("Y") }}</title>
    <meta content="Catch the fire conference CTF" name="description">
    <meta content="CTF-{{ date("Y") }}, CTF {{ date("Y") }}, CTF, Catch The Fire, CTF Registration, Heartfelt, HIM, Heartfelt International Ministries, Catch the fire conference, Tavonga Vutabwashe, Chipo Vutabwashe, Apostle T Vutabwashe, Pastor C Vutabwashe, Heartfelt Events, Heartfelt International Ministries Events, CTF Zimbabwe, Catch the fire Zimbabwe, Catch The fire Heartfelt" name="keywords">

    <!-- Favicons -->
    <link href="{{asset('images/favicon.ico')}}" rel="icon">
    <link href="{{asset('client/img/apple-touch-icon.png')}}" rel="apple-touch-icon">

    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,700,700i|Raleway:300,400,500,700,800" rel="stylesheet">

    <!-- Vendor CSS Files -->
    <link href="{{asset('client/vendor/aos/aos.css')}}" rel="stylesheet">
    <link href="{{asset('client/vendor/bootstrap/css/bootstrap.min.css')}}" rel="stylesheet">
    <link href="{{asset('client/vendor/bootstrap-icons/bootstrap-icons.css')}}" rel="stylesheet">
    <link href="{{asset('client/vendor/glightbox/css/glightbox.min.css')}}" rel="stylesheet">
    <link href="{{asset('client/vendor/swiper/swiper-bundle.min.css')}}" rel="stylesheet">

    <!-- Template Main CSS File -->
    <link href="{{asset('client/css/style.css')}}" rel="stylesheet">
    @yield('styles')
</head>

<body>
<script src="https://code.jquery.com/jquery-1.12.4.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-easing/1.4.1/jquery.easing.min.js"></script>

@yield('jQuery')

@yield('content')

<!-- ======= Footer ======= -->
<footer id="footer">
    <div class="container">
        <div class="copyright">
            &copy; Copyright <a href="/"><strong>Heartfelt</strong></a>. All Rights Reserved
        </div>
        <div class="credits">
            Designed and Developed by <a href="https://wa.me/+263773644451">Heartfelt Software Team</a>
        </div>
    </div>
</footer><!-- End  Footer -->

<a href="#" class="back-to-top d-flex align-items-center justify-content-center"><i class="bi bi-arrow-up-short"></i></a>

<!-- Vendor JS Files -->
<script src="{{asset('client/vendor/aos/aos.js')}}"></script>
<script src="{{asset('client/vendor/bootstrap/js/bootstrap.bundle.min.js')}}"></script>
<script src="{{asset('client/vendor/glightbox/js/glightbox.min.js')}}"></script>
<script src="{{asset('client/vendor/swiper/swiper-bundle.min.js')}}"></script>
<script src="{{asset('client/vendor/php-email-form/validate.js')}}"></script>

<!-- Template Main JS File -->
<script src="{{asset('client/js/main.js')}}"></script>
@yield('scripts')
</body>

</html>
