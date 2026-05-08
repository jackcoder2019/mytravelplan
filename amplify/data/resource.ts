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

  Feedback: a
    .model({
      comment: a.string().required(),
      userEmail: a.string(),
    })
    .authorization(allow => [
      allow.authenticated().to(['create', 'list', 'get']),
      allow.owner().to(['delete']),
    ]),
})

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
})
