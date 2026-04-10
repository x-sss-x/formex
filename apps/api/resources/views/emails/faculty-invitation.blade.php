<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Faculty Invitation</title>
</head>
<body style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
    <p>Hello {{ $fullName }},</p>

    <p>You have been invited to join <strong>{{ $institutionName }}</strong> on Formex.</p>

    <p>
        Complete your signup using this link:
        <a href="{{ $signupUrl }}">{{ $signupUrl }}</a>
    </p>

    <p>This invitation link expires in 7 days.</p>

    <p>Thanks,<br>Formex Team</p>
</body>
</html>
