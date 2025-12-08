/**
 * WebSocket handler for Twilio Media Stream -> OpenAI Realtime API
 * Handles bidirectional audio streaming between Twilio and OpenAI
 */

export async function onRequest(context) {
  const { request, env } = context;
  
  // Upgrade to WebSocket
  const upgradeHeader = request.headers.get('Upgrade');
  if (!upgradeHeader || upgradeHeader !== 'websocket') {
    return new Response('Expected Upgrade: websocket', { status: 426 });
  }
  
  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);
  
  // Handle WebSocket connection
  handleWebSocket(server, env);
  
  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}

async function handleWebSocket(ws, env) {
  let openAIWs = null;
  let callSid = null;
  let streamSid = null;
  
  try {
    ws.accept();
    
    ws.addEventListener('message', async (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.event) {
          case 'start':
            // Extract call information
            callSid = data.start.callSid;
            streamSid = data.start.streamSid;
            console.log(`Stream started: ${streamSid} for call ${callSid}`);
            
            // Connect to OpenAI Realtime API
            openAIWs = await connectToOpenAI(env, ws);
            break;
            
          case 'media':
            // Forward audio from Twilio to OpenAI
            if (openAIWs && openAIWs.readyState === WebSocket.OPEN) {
              // Twilio sends base64 μ-law audio, OpenAI expects PCM16
              const audioData = {
                type: 'input_audio_buffer.append',
                audio: data.media.payload, // base64 audio
              };
              openAIWs.send(JSON.stringify(audioData));
            }
            break;
            
          case 'stop':
            console.log(`Stream stopped: ${streamSid}`);
            if (openAIWs) {
              openAIWs.close();
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.addEventListener('close', () => {
      console.log('Twilio WebSocket closed');
      if (openAIWs) {
        openAIWs.close();
      }
    });
    
    ws.addEventListener('error', (error) => {
      console.error('Twilio WebSocket error:', error);
      if (openAIWs) {
        openAIWs.close();
      }
    });
    
  } catch (error) {
    console.error('WebSocket handler error:', error);
    ws.close(1011, 'Internal error');
  }
}

async function connectToOpenAI(env, twilioWs) {
  const openAIWs = new WebSocket(
    'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17',
    {
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'OpenAI-Beta': 'realtime=v1',
      },
    }
  );
  
  openAIWs.addEventListener('open', async () => {
    console.log('Connected to OpenAI Realtime API');
    
    // Configure session
    const sessionConfig = {
      type: 'session.update',
      session: {
        modalities: ['text', 'audio'],
        instructions: await getSystemPrompt(env),
        voice: 'alloy',
        input_audio_format: 'g711_ulaw', // Match Twilio format
        output_audio_format: 'g711_ulaw',
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500,
        },
      },
    };
    
    openAIWs.send(JSON.stringify(sessionConfig));
  });
  
  openAIWs.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'response.audio.delta':
          // Forward audio from OpenAI to Twilio
          if (twilioWs.readyState === WebSocket.OPEN) {
            const mediaMessage = {
              event: 'media',
              streamSid: twilioWs.streamSid,
              media: {
                payload: data.delta, // base64 audio
              },
            };
            twilioWs.send(JSON.stringify(mediaMessage));
          }
          break;
          
        case 'response.function_call_arguments.done':
          // Handle function calls (knowledge base lookups)
          handleFunctionCall(data, env, openAIWs);
          break;
          
        case 'error':
          console.error('OpenAI error:', data.error);
          break;
      }
    } catch (error) {
      console.error('OpenAI message error:', error);
    }
  });
  
  openAIWs.addEventListener('close', () => {
    console.log('OpenAI WebSocket closed');
  });
  
  openAIWs.addEventListener('error', (error) => {
    console.error('OpenAI WebSocket error:', error);
  });
  
  return openAIWs;
}

async function getSystemPrompt(env) {
  return `You are a professional AI receptionist for CyberGuardNG Security Inc., a cybersecurity consulting firm.

Your responsibilities:
1. Greet callers warmly and professionally
2. Answer questions about our services (SOC 2, ISO 27001, PCI DSS compliance, incident response)
3. Provide information from our knowledge base when asked
4. Take messages for callbacks
5. Be concise and clear - this is a phone call, not a chat

Our services:
- Compliance Consulting (SOC 2, ISO 27001, PCI DSS, HIPAA)
- Security Assessments & Penetration Testing
- Incident Response & Forensics
- Virtual CISO Services
- Security Training & Awareness

Contact: sales@cyberguardng.ca
Website: https://cyberguardng.ca

Guidelines:
- Keep responses under 30 seconds
- Speak naturally like a human receptionist
- If asked complex technical questions, offer to have a specialist call back
- Always offer to connect them with someone or take a message
- Be friendly but professional`;
}

async function handleFunctionCall(data, env, openAIWs) {
  // Future: Implement knowledge base lookups from D1
  console.log('Function call:', data.name, data.arguments);
  
  // For now, return a generic response
  const functionResponse = {
    type: 'conversation.item.create',
    item: {
      type: 'function_call_output',
      call_id: data.call_id,
      output: JSON.stringify({
        status: 'success',
        message: 'Knowledge base feature coming soon',
      }),
    },
  };
  
  openAIWs.send(JSON.stringify(functionResponse));
}
