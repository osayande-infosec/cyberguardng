from flask import Flask, Response

app = Flask(__name__)

@app.route("/voice-webhook", methods=['POST'])
def voice_webhook():
    twiml = """
    <Response>
      <Dial>+14379084824</Dial>
    </Response>
    """
    return Response(twiml, mimetype='text/xml')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
