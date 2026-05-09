import { NextRequest, NextResponse } from 'next/server'
import { SchedulerClient, CreateScheduleCommand, DeleteScheduleCommand, FlexibleTimeWindowMode, UpdateScheduleCommand } from '@aws-sdk/client-scheduler'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const scheduler = new SchedulerClient({ region: process.env.AWS_REGION ?? 'us-west-2' })

// Read role ARN from env var (set in Amplify Console) or from amplify_outputs.json custom section
function getSchedulerRoleArn(): string {
  if (process.env.SCHEDULER_ROLE_ARN) return process.env.SCHEDULER_ROLE_ARN
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const outputs = require('../../../../amplify_outputs.json')
    return outputs?.custom?.schedulerRoleArn ?? ''
  } catch { return '' }
}

export async function POST(req: NextRequest) {
  const { transportId, email, scheduledAt, subject, body } = await req.json()
  const roleArn = getSchedulerRoleArn()

  if (!email || !scheduledAt) {
    return NextResponse.json({ error: 'email and scheduledAt are required' }, { status: 400 })
  }
  if (!roleArn) {
    return NextResponse.json({
      error: 'SCHEDULER_ROLE_ARN not configured — deploy the Amplify backend first, then add the role ARN to your environment',
    }, { status: 500 })
  }

  // EventBridge Scheduler at() expression: "at(YYYY-MM-DDTHH:MM:SS)"
  const atExpr = `at(${scheduledAt.slice(0, 16).replace('T', 'T')}:00)`

  const sesInput = JSON.stringify({
    Source: email,
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: subject },
      Body: { Text: { Data: body } },
    },
  })

  try {
    await scheduler.send(new CreateScheduleCommand({
      Name: `reminder-${transportId}`,
      ScheduleExpression: atExpr,
      ScheduleExpressionTimezone: 'UTC',
      FlexibleTimeWindow: { Mode: FlexibleTimeWindowMode.OFF },
      Target: {
        // EventBridge Scheduler → SES direct (no Lambda needed)
        Arn: 'arn:aws:scheduler:::aws-sdk:ses:sendEmail',
        RoleArn: roleArn,
        Input: sesInput,
      },
      ActionAfterCompletion: 'DELETE',
    }))
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    // If a schedule already exists, update it
    if (e.name === 'ConflictException') {
      await scheduler.send(new UpdateScheduleCommand({
        Name: `reminder-${transportId}`,
        ScheduleExpression: atExpr,
        ScheduleExpressionTimezone: 'UTC',
        FlexibleTimeWindow: { Mode: FlexibleTimeWindowMode.OFF },
        Target: { Arn: 'arn:aws:scheduler:::aws-sdk:ses:sendEmail', RoleArn: roleArn, Input: sesInput },
        ActionAfterCompletion: 'DELETE',
      }))
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { transportId } = await req.json()
  try {
    await scheduler.send(new DeleteScheduleCommand({ Name: `reminder-${transportId}` }))
  } catch { /* already deleted is fine */ }
  return NextResponse.json({ ok: true })
}
