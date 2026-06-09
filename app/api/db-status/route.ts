import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const hasDatabaseUrl = !!process.env.DATABASE_URL;
    const databaseUrlLength = process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0;
    const databaseUrlStart = process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) : "none";

    const hasDirectUrl = !!process.env.DIRECT_URL;
    const directUrlLength = process.env.DIRECT_URL ? process.env.DIRECT_URL.length : 0;

    let dbTestResult = "not tried";
    let dbTestError = null;

    try {
      // Run a simple query to verify database connection
      const result = await prisma.$queryRaw`SELECT 1 as result`;
      dbTestResult = JSON.stringify(result);
    } catch (err: any) {
      dbTestError = {
        message: err.message,
        stack: err.stack,
        code: err.code,
      };
    }

    return NextResponse.json({
      hasDatabaseUrl,
      databaseUrlLength,
      databaseUrlStart,
      hasDirectUrl,
      directUrlLength,
      dbTestResult,
      dbTestError,
      envKeys: Object.keys(process.env).filter(k => !k.includes("SECRET") && !k.includes("KEY") && !k.includes("PASSWORD")),
    });
  } catch (err: any) {
    return NextResponse.json({
      error: "Failed to run status check",
      message: err.message,
      stack: err.stack,
    }, { status: 500 });
  }
}
