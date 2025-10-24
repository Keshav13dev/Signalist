import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/database/mongoose';

// GET /api/db — checks MongoDB connectivity
export async function GET() {
  const startedAt = Date.now();
  try {
    await connectToDatabase();

    // Issue a lightweight ping to verify the connection is alive
    // Works for both mongoose >= 6 and MongoDB driver
    // If using mongoose, connection.db.admin().ping() is available when connected
    const admin = mongoose.connection?.db?.admin?.();
    let pingOk: boolean | undefined = undefined;
    if (admin && typeof admin.ping === 'function') {
      const ping = await admin.ping();
      pingOk = ping?.ok === 1;
    }

    const durationMs = Date.now() - startedAt;
    return NextResponse.json({
      ok: true,
      message: 'Database connection is healthy',
      nodeEnv: process.env.NODE_ENV,
      pingOk,
      durationMs,
      mongoHost: mongoose.connection?.host,
      mongoName: mongoose.connection?.name,
    });
  } catch (error: any) {
    const durationMs = Date.now() - startedAt;
    return NextResponse.json(
      {
        ok: false,
        message: 'Database connection failed',
        error: error?.message || String(error),
        nodeEnv: process.env.NODE_ENV,
        durationMs,
      },
      { status: 500 }
    );
  }
}
