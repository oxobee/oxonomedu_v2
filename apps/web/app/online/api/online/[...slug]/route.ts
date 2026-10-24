import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const path = (slug || []).join("/");
  const url = new URL(req.url);

  const page = parseInt(url.searchParams.get("page") || "1", 10);

  if (path.startsWith("dashboard")) {
    return NextResponse.json({
      years: ["2025-2026", "2026-2027"],
      total: 0,
      page: page,
      page_size: 10,
      summary: {
        open: 0,
        live: 0,
        planned: 0,
        closed: 0,
      },
      tests: [],
      recent: [],
      notice_count: 0,
      notices: [],
      as_of: new Date().toISOString(),
    });
  }

  if (path.startsWith("tests/library") || path.startsWith("library")) {
    return NextResponse.json({
      years: ["2025-2026", "2026-2027"],
      total: 0,
      page: page,
      page_size: 10,
      tests: [],
    });
  }

  if (path.startsWith("classes")) {
    return NextResponse.json([]);
  }

  if (path.startsWith("tests")) {
    return NextResponse.json([]);
  }

  return NextResponse.json({
    success: true,
    data: [],
  });
}

export async function POST(
  _req: NextRequest,
  _context: { params: Promise<{ slug: string[] }> }
) {
  return NextResponse.json({ success: true });
}

export async function PUT(
  _req: NextRequest,
  _context: { params: Promise<{ slug: string[] }> }
) {
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  _context: { params: Promise<{ slug: string[] }> }
) {
  return NextResponse.json({ success: true });
}
