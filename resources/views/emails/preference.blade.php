@extends('portal.shell')
@section('title', 'Email preferences')
@section('content')
    <div class="center">
        <h1>{{ $subscribed ? 'You are subscribed again' : 'You are unsubscribed' }}</h1>
        <p>
            @if($subscribed)
                We will email <strong>{{ $email }}</strong> a copy of your portal notifications again.
            @else
                We will no longer email <strong>{{ $email }}</strong> copies of portal notifications. You will still receive receipts, security alerts and password resets, and notifications still appear in your portal.
            @endif
        </p>
        <a class="btn" href="{{ $portalUrl }}">Go to my portal</a>
        <a class="btn alt" href="{{ $toggleUrl }}">{{ $subscribed ? 'Stop email copies' : 'Undo — send me email copies again' }}</a>
    </div>
@endsection
