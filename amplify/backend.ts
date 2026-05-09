import { defineBackend } from '@aws-amplify/backend'
import { auth } from './auth/resource.js'
import { data } from './data/resource.js'
import { Role, ServicePrincipal, PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam'

const backend = defineBackend({ auth, data })

// IAM role that EventBridge Scheduler uses to call SES directly (no Lambda needed)
const schedulerStack = backend.createStack('SchedulerStack')
const schedulerRole = new Role(schedulerStack, 'SchedulerSESRole', {
  assumedBy: new ServicePrincipal('scheduler.amazonaws.com'),
})
schedulerRole.addToPolicy(new PolicyStatement({
  effect: Effect.ALLOW,
  actions: ['ses:SendEmail', 'ses:SendRawEmail'],
  resources: ['*'],
}))

backend.addOutput({
  custom: {
    schedulerRoleArn: schedulerRole.roleArn,
  },
})
