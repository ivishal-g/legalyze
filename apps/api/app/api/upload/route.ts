import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Add CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Check if content type is multipart/form-data
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: "Content-Type must be multipart/form-data" },
        { status: 400, headers: corsHeaders }
      );
    }

    let formData;
    try {
      formData = await req.formData();
    } catch (parseError) {
      console.error('FormData parse error:', parseError);
      return NextResponse.json(
        { success: false, error: "Failed to parse form data" },
        { status: 400, headers: corsHeaders }
      );
    }

    const file = formData.get("file") as File;

    if (!file) {
      // Log all form data keys for debugging
      const keys = Array.from(formData.keys());
      console.log('Available form data keys:', keys);
      return NextResponse.json(
        { success: false, error: "No file uploaded. Available keys: " + keys.join(', ') },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate file
    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Invalid file format" },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('File received:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Prepare form data for n8n
    const n8nFormData = new FormData();
    n8nFormData.append(
      "file",
      new Blob([fileBuffer], { type: file.type }),
      file.name
    );

    // 🔥 Your n8n test webhook URL
    const n8nWebhookUrl = "https://vish20000006.app.n8n.cloud/webhook-test/summarize-pdf";
    
    console.log('Calling n8n webhook:', n8nWebhookUrl);
    console.log('n8nFormData entries:', Array.from(n8nFormData.keys()));

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      body: n8nFormData,
    });

    console.log('n8n response status:', n8nResponse.status);
    console.log('n8n response headers:', Object.fromEntries(n8nResponse.headers.entries()));

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('n8n error response:', errorText);
      return NextResponse.json(
        { success: false, error: "n8n failed", details: errorText },
        { status: 500, headers: corsHeaders }
      );
    }

    const result = await n8nResponse.json();

    // Map AI result into frontend structure
    return NextResponse.json({
      success: true,
      contractType: "Analyzed Contract",
      riskScore:
        result.overall_risk === "High"
          ? 80
          : result.overall_risk === "Medium"
          ? 50
          : 20,
      analysis: result,
    }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Unknown error" },
      { status: 500, headers: corsHeaders }
    );
  }
}