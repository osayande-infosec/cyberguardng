import os
from twilio.rest import Client

# Get credentials from environment variables
account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
client = Client(account_sid, auth_token)

to = "+14379084824"      # Your live phone
from_ = "+16476950950"   # Your Twilio number

call = client.calls.create(
    to=to,
    from_=from_,
    url="https://cyberguardng.ca/voice-webhook"  # This should return the TwiML for forwarding
)

print(f"Call SID: {call.sid}")
