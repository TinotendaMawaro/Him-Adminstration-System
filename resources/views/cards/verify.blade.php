<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>ID verification · Heartfelt International Ministries</title>
    <style>
        :root { --navy:#0f2744; --gold:#c9a84c; --ok:#14804a; --bad:#b42318; --ink:#10233b; --mut:#5b6b80; --card:#ffffff; --bg:#eef2f7; }
        @media (prefers-color-scheme: dark) { :root { --ink:#eaf0f8; --mut:#9fb0c6; --card:#14263f; --bg:#0b1626; --ok:#4cd38b; --bad:#ff8a7a; } }
        * { box-sizing: border-box; }
        body { margin:0; min-height:100vh; display:grid; place-items:center; padding:16px; background:var(--bg); color:var(--ink); font-family:Inter,system-ui,Segoe UI,Arial,sans-serif; }
        .card { width:100%; max-width:420px; background:var(--card); border-radius:22px; overflow:hidden; box-shadow:0 20px 50px rgba(15,39,68,.18); }
        .top { background:linear-gradient(135deg,var(--navy),#1e3a5f); color:#fff; padding:22px 24px; display:flex; gap:14px; align-items:center; }
        .top img { width:48px; height:48px; border-radius:12px; background:#fff; padding:3px; object-fit:contain; }
        .top b { display:block; font-family:Georgia,serif; font-size:18px; letter-spacing:.5px; }
        .top span { font-size:11px; letter-spacing:2.5px; color:#e8cf8a; }
        .body { padding:26px 24px 30px; text-align:center; }
        .badge { display:inline-flex; align-items:center; gap:8px; padding:8px 16px; border-radius:999px; font-weight:700; font-size:14px; }
        .ok { background:rgba(20,128,74,.14); color:var(--ok); } .bad { background:rgba(180,35,24,.14); color:var(--bad); }
        h1 { font-family:Georgia,serif; font-size:26px; margin:20px 0 4px; } .role { color:var(--gold); font-weight:700; letter-spacing:2px; font-size:12px; text-transform:uppercase; }
        dl { margin:22px 0 0; text-align:left; display:grid; gap:12px; } dt { font-size:11px; letter-spacing:2px; color:var(--mut); text-transform:uppercase; } dd { margin:2px 0 0; font-size:17px; font-weight:600; }
        p.note { margin:22px 0 0; font-size:12px; color:var(--mut); }
    </style>
</head>
<body>
<main class="card">
    <div class="top"><img src="{{ asset('images/logo.jpeg') }}" alt=""><div><b>Heartfelt</b><span>INTERNATIONAL MINISTRIES</span></div></div>
    <div class="body">
    @if ($card && $card['valid'])
        <span class="badge ok">&#10004; Genuine &middot; Active</span>
        <h1>{{ $card['name'] }}</h1>
        <div class="role">{{ $card['role_label'] }}</div>
        <dl>
            <div><dt>{{ $card['number_label'] }}</dt><dd>{{ $card['number'] }}</dd></div>
            @if ($card['zone'])<div><dt>Zone</dt><dd>{{ $card['zone'] }}</dd></div>@endif
        </dl>
    @elseif ($card)
        <span class="badge bad">&#10006; No longer active</span>
        <h1>{{ $card['name'] }}</h1>
        <p class="note">This card belongs to a person whose account is no longer active. Please do not accept it as identification.</p>
    @else
        <span class="badge bad">&#10006; Not recognised</span>
        <h1>This card could not be verified</h1>
        <p class="note">The code is not valid. If you believe this is a mistake, contact {{ config('mailing.support_email') }}.</p>
    @endif
        <p class="note">Verification shows only what is needed to confirm identity. Nothing private is displayed.</p>
    </div>
</main>
</body>
</html>
