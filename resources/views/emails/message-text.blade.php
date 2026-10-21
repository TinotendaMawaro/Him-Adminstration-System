{!! strtoupper($brand['name']) !!}
------------------------------------------------------------

{!! $m['title'] !!}
@if($m['greeting'])

{!! $m['greeting'] !!}
@endif
@foreach($m['intro'] as $line)

{!! $line !!}
@endforeach
@if(!empty($m['facts']))

@foreach($m['facts'] as $label => $value)
{!! str_pad($label . ':', 22) !!}{!! $value !!}
@endforeach
@endif
@if($m['notice'])

NOTE: {!! $m['notice'] !!}
@endif
@if($m['cta'])

{!! $m['cta']['label'] !!}:
{!! $m['cta']['url'] !!}
@endif
@foreach($m['outro'] as $line)

{!! $line !!}
@endforeach

With love in Christ,
{!! $brand['short'] !!} Family

------------------------------------------------------------
{!! $brand['name'] !!} - {!! $brand['tagline'] !!}
Questions? {!! $supportEmail !!}
Portal: {!! $portalUrl !!}
@if($recipient)
Sent to {!! $recipient !!}.
@endif
@if($unsubscribeUrl)
Stop these email copies: {!! $unsubscribeUrl !!}
@endif
