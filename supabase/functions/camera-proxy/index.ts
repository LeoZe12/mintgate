import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { method } = req
    const url = new URL(req.url)
    
    if (method === 'POST' && url.pathname === '/camera-proxy') {
      const { cameraUrl, action } = await req.json()
      
      if (action === 'test') {
        return await testCameraConnection(cameraUrl)
      } else if (action === 'capture') {
        return await captureImage(cameraUrl)
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Camera proxy error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function testCameraConnection(rtspUrl: string) {
  const testUrls = generateTestUrls(rtspUrl)
  
  for (const testUrl of testUrls) {
    try {
      console.log(`Testing URL: ${testUrl}`)
      
      const response = await fetch(testUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      })
      
      if (response.ok) {
        console.log(`✅ Working URL found: ${testUrl}`)
        return new Response(
          JSON.stringify({ 
            success: true, 
            workingUrl: testUrl,
            message: 'Camera connected successfully' 
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    } catch (error) {
      console.log(`❌ Failed URL: ${testUrl}`, error.message)
    }
  }
  
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: 'Could not connect to camera. Please verify the URL and network connectivity.',
      testedUrls: testUrls
    }),
    { 
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function captureImage(cameraUrl: string) {
  try {
    const response = await fetch(cameraUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const imageBlob = await response.blob()
    
    return new Response(imageBlob, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': response.headers.get('content-type') || 'image/jpeg',
      },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Failed to capture image: ${error.message}` }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

function generateTestUrls(rtspUrl: string): string[] {
  try {
    const url = new URL(rtspUrl)
    const host = url.hostname
    const username = url.username
    const password = url.password
    const auth = username && password ? `${username}:${password}@` : ''
    
    return [
      // HTTP snapshot URLs (most common for IP cameras)
      `http://${auth}${host}/Streaming/Channels/101/picture`,
      `http://${auth}${host}/Streaming/Channels/1/picture`,
      `http://${auth}${host}/snapshot.jpg`,
      `http://${auth}${host}/cgi-bin/snapshot.cgi`,
      `http://${auth}${host}/image/jpeg.cgi`,
      `http://${auth}${host}/image.jpg`,
      
      // MJPEG stream URLs
      `http://${auth}${host}/mjpeg/1`,
      `http://${auth}${host}/video.mjpg`,
      `http://${auth}${host}/cgi-bin/mjpg/video.cgi`,
      
      // Alternative ports
      `http://${auth}${host}:80/Streaming/Channels/101/picture`,
      `http://${auth}${host}:8080/snapshot.jpg`,
      `http://${auth}${host}:81/image.jpg`,
      
      // Hikvision specific
      `http://${auth}${host}/ISAPI/Streaming/channels/101/picture`,
      `http://${auth}${host}/ISAPI/Streaming/channels/1/picture`,
      
      // Dahua specific
      `http://${auth}${host}/cgi-bin/currentpic.cgi`,
      
      // Generic patterns
      `http://${auth}${host}/axis-cgi/jpg/image.cgi`,
      `http://${auth}${host}/jpg/image.jpg`,
    ]
  } catch (error) {
    console.error('Error generating test URLs:', error)
    return [rtspUrl]
  }
}