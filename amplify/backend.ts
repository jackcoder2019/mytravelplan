import { defineBackend } from '@aws-amplify/backend'
import { auth } from './auth/resource.js'
import { data } from './data/resource.js'
import { emailReminder } from './functions/email-reminder/resource.js'
import { Role, ServicePrincipal, PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam'

const backend = defineBackend({ auth, data, emailReminder })

// SES permission for the Lambda
backend.emailReminder.resources.lambda.addToRolePolicy(new PolicyStatement({
  effect: Effect.ALLOW,
  actions: ['ses:SendEmail', 'ses:SendRawEmail'],
  resources: ['*'],
}))

// DynamoDB read/write on Itinerary table
const itineraryTable = backend.data.resources.tables['Itinerary']
itineraryTable.grantReadWriteData(backend.emailReminder.resources.lambda)

// Pass table name into Lambda as env var
backend.emailReminder.addEnvironment('ITINERARY_TABLE_NAME', itineraryTable.tableName)

// IAM role that EventBridge Scheduler uses to invoke the Lambda
const schedulerStack = backend.createStack('SchedulerStack')
const schedulerRole = new Role(schedulerStack, 'SchedulerLambdaRole', {
  assumedBy: new ServicePrincipal('scheduler.amazonaws.com'),
})
backend.emailReminder.resources.lambda.grantInvoke(schedulerRole)

backend.addOutput({
  custom: {
    reminderLambdaArn: backend.emailReminder.resources.lambda.functionArn,
    schedulerRoleArn: schedulerRole.roleArn,
  },
})
