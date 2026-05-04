import { a, defineData, type ClientSchema } from '@aws-amplify/backend'

const schema = a.schema({
  Itinerary: a
    .model({
      owner: a.string(),
      sharedWith: a.string().array(),
      shareToken: a.string(),
      shareLinkEnabled: a.boolean(),
      data: a.string().required(),
    })
    .authorization(allow => [
      allow.owner(),
    ]),
})

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
})
