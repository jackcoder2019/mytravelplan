import { NextRequest, NextResponse } from 'next/server'
import { SchedulerClient, CreateScheduleCommand, DeleteScheduleCommand, UpdateScheduleCommand, FlexibleTimeWindowMode } from '@aws-sdk/client-scheduler'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const scheduler = new SchedulerClient({ region: process.env.AWS_REGION ?? 'us-west-2' })

function getOutputs() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const o = require('../../../../amplify_outputs.json')
    return { lambdaArn: o?.custom?.reminderLambdaArn ?? '', roleArn: o?.custom?.schedulerRoleArn ?? '' }
  } catch { return { lambdaArn: '', roleArn: '' } }
}

export async function POST(req: NextRequest) {
  const { transportId, itineraryId, email, scheduledAt, subject, body } = await req.json()
  const { lambdaArn, roleArn } = getOutputs()

  if (!email || !scheduledAt || !itineraryId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (!lambdaArn || !roleArn) {
    return NextResponse.json({ error: 'Backend not fully deployed yet — push to GitHub and wait for Amplify build' }, { status: 500 })
  }

  const atExpr = `at(${scheduledAt.slice(0, 16)}:00)`
  const input = JSON.stringify({ email, subject, body, itineraryId, transportId })

  const scheduleParams = {
    Name: `reminder-${transportId}`,
    ScheduleExpression: atExpr,
    ScheduleExpressionTimezone: 'UTC',
    FlexibleTimeWindow: { Mode: FlexibleTimeWindowMode.OFF },
    Target: { Arn: lambdaArn, RoleArn: roleArn, Input: input },
    ActionAfterCompletion: 'DELETE' as const,
  }

  try {
    await scheduler.send(new CreateScheduleCommand(scheduleParams))
  } catch (e: any) {
    if (e.name === 'ConflictException') {
      await scheduler.send(new UpdateScheduleCommand(scheduleParams))
    } else {
      return NextResponse.json({ error: e.message }, { status: 500 })
    }
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { transportId } = await req.json()
  try {
    await scheduler.send(new DeleteScheduleCommand({ Name: `reminder-${transportId}` }))
  } catch { /* already gone */ }
  return NextResponse.json({ ok: true })
}
