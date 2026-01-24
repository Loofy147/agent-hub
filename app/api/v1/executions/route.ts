import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { executeAgent } from '@/orchestration/engine';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const ExecuteSchema = z.object({
  agentType: z.enum(['tuber', 'bolt', 'sentinel', 'suntzu', 'palette', 'midas', 'oracle']),
  context: z.object({
    codebase: z.string().optional(),
    constraints: z.record(z.any()).optional(),
    focus: z.string().optional()
  })
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { agentType, context } = ExecuteSchema.parse(body);

    const result = await executeAgent({
      workspaceId: session.user.workspaceId,
      agentType,
      context
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const executions = await prisma.agentExecution.findMany({
    where: {
      workspaceId: session.user.workspaceId,
      deletedAt: null
    },
    select: {
      id: true,
      agentType: true,
      agentVersion: true,
      status: true,
      phase: true,
      progress: true,
      startedAt: true,
      completedAt: true,
      duration: true,
      createdAt: true
      // BOLT: Exclude large JSON fields for list view
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return NextResponse.json({ executions });
}
