<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <meta name="referrer" content="no-referrer">
    <title>@yield('title') · Heartfelt</title>
    <style>
        :root { --navy:#1e3a5f; --gold:#c9a84c; --ink:#1f2937; --muted:#6b7280; --ok:#15803d; --bad:#b91c1c; }
        * { box-sizing:border-box; }
        body { margin:0; min-height:100vh; display:grid; place-items:center; padding:24px; background:linear-gradient(160deg,#eef2f7,#f8f5ec);
               color:var(--ink); font:16px/1.55 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif; }
        .card { width:100%; max-width:440px; background:#fff; border-radius:18px; box-shadow:0 20px 50px -20px rgba(30,58,95,.35); overflow:hidden; }
        .top { background:#fff; padding:22px 18px 16px; text-align:center; border-bottom:4px solid var(--navy); box-shadow:0 3px 0 var(--gold); }
        .top img { display:block; margin:0 auto; width:150px; max-width:60%; height:auto; }
        .body { padding:32px 30px 28px; }
        h1 { margin:0 0 6px; font-size:22px; letter-spacing:-.01em; color:var(--navy); }
        p { margin:0 0 14px; color:var(--muted); }
        label { display:block; margin:16px 0 6px; font-size:13px; font-weight:600; color:#374151; }
        input { width:100%; padding:12px 14px; border:1px solid #cbd5e1; border-radius:10px; font-size:16px; }
        input:focus { outline:none; border-color:var(--navy); box-shadow:0 0 0 3px rgba(30,58,95,.15); }
        button, .btn { display:inline-block; width:100%; margin-top:22px; padding:13px; border:0; border-radius:10px; background:var(--navy); color:#fff; font-size:16px; font-weight:600; cursor:pointer; text-align:center; text-decoration:none; }
        button:disabled { opacity:.5; cursor:not-allowed; }
        .btn.alt { background:transparent; color:var(--navy); border:1px solid #cbd5e1; margin-top:10px; }
        .msg { margin-top:16px; padding:12px 14px; border-radius:10px; font-size:14px; display:none; }
        .msg.ok { display:block; background:#e8f6ee; color:var(--ok); } .msg.bad { display:block; background:#fdecec; color:var(--bad); }
        .hint { font-size:12px; color:var(--muted); margin-top:6px; }
        .center { text-align:center; }
    </style>
</head>
<body>
<main class="card">
    <div class="top"><img src="{{ asset('images/logo.jpeg') }}" alt="Heartfelt International Ministries"></div>
    <div class="body">@yield('content')</div>
</main>
@stack('scripts')
</body>
</html>
