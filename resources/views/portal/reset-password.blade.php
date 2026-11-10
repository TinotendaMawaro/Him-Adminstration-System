@extends('portal.shell')
@section('title', 'Choose a new password')
@section('content')
    <h1>Choose a new password</h1>
    <p>Pick something only you know. At least 10 characters, with upper and lower case letters and a number.</p>

    <form id="f" novalidate>
        <label for="email">Email address</label>
        <input id="email" type="email" value="{{ e($email) }}" readonly>

        <label for="password">New password</label>
        <input id="password" type="password" autocomplete="new-password" minlength="8" required>

        <label for="password2">Confirm new password</label>
        <input id="password2" type="password" autocomplete="new-password" minlength="8" required>

        <button id="go" type="submit">Change my password</button>
    </form>
    <div id="msg" class="msg" role="status" aria-live="polite"></div>
    <a id="signin" class="btn" href="{{ config('mailing.portal_url') ?: url('/') }}" style="display:none">Sign in</a>
@endsection
@push('scripts')
<script>
    const f = document.getElementById('f'), msg = document.getElementById('msg'), go = document.getElementById('go');
    f.addEventListener('submit', async (e) => {
        e.preventDefault();
        const p1 = document.getElementById('password').value, p2 = document.getElementById('password2').value;
        if (p1 !== p2) { msg.className = 'msg bad'; msg.textContent = 'The two passwords do not match.'; return; }
        go.disabled = true; go.textContent = 'Saving…'; msg.className = 'msg';
        try {
            const r = await fetch('/api/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ token: @json($token), email: document.getElementById('email').value, password: p1, password_confirmation: p2 }) });
            const j = await r.json().catch(() => ({}));
            if (r.ok) {
                msg.className = 'msg ok'; msg.textContent = j.message; f.style.display = 'none'; document.getElementById('signin').style.display = 'inline-block';
            } else {
                msg.className = 'msg bad';
                msg.textContent = j.errors?.password?.[0] || j.message || 'Something went wrong. Please try again.';
                go.disabled = false; go.textContent = 'Change my password';
            }
        } catch (_) {
            msg.className = 'msg bad'; msg.textContent = 'We could not reach the server. Please try again.';
            go.disabled = false; go.textContent = 'Change my password';
        }
    });
</script>
@endpush
