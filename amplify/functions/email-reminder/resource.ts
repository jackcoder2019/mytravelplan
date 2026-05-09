import { defineFunction } from '@aws-amplify/backend'

export const emailReminder = defineFunction({
  name: 'email-reminder',
  entry: './handler.ts',
  timeoutSeconds: 30,
})
