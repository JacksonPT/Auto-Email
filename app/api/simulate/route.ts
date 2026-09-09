import { NextResponse } from "next/server";
import { processDueSimulations } from "@/lib/simulation";

export const dynamic = "force-dynamic";

export async function POST() {
  const result = processDueSimulations();
  return NextResponse.json(result, {
    status: result.errors.length > 0 ? 207 : 200,
  });
}
