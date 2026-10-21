@extends('portal.shell')
@section('title', 'Forgot password')
@section('content')
    <h1>Forgot your password?</h1>
    <p>Enter the email on your account and we will send you a secure link to choose a new one.</p>

    <form id="f" novalidate>
        <label for="email">Email address</label>
        <input id="email" type="email" autocomplete="email" required value="{{ e(request('email')) }}">
        <button id="go" type="submit">Email me a reset link</button>
    </form>
    <div id="msg" class="msg" role="status" aria-live="polite"></div>

    <a class="btn alt" href="{{ config('mailing.portal_url') ?: url('/') }}">Back to sign in</a>
    <p class="hint center" style="margin-top:18px">Pastors sign in with their pastor code and have no password to reset.</p>
@endsection
@push('scripts')
<script>
    const f = document.getElementById('f'), msg = document.getElementById('msg'), go = document.getElementById('go');
    f.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        if (!email) { msg.className = 'msg bad'; msg.textContent = 'Please enter your email address.'; return; }
        go.disabled = true; go.textContent = 'Sending…'; msg.className = 'msg';
        try {
            const r = await fetch('/api/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ email }) });
            const j = await r.json().catch(() => ({}));
            msg.className = r.ok ? 'msg ok' : 'msg bad';
            msg.textContent = r.ok ? j.message : (j.errors?.email?.[0] || j.message || 'Something went wrong. Please try again.');
            if (r.ok) go.textContent = 'Email sent';
            else { go.disabled = false; go.textContent = 'Email me a reset link'; }
        } catch (_) {
            msg.className = 'msg bad'; msg.textContent = 'We could not reach the server. Please try again.';
            go.disabled = false; go.textContent = 'Email me a reset link';
        }
    });
</script>
@endpush
