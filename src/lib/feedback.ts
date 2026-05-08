'use client'
import { generateClient } from 'aws-amplify/api'

const client = generateClient()

const createFeedbackMutation = /* GraphQL */ `
  mutation CreateFeedback($input: CreateFeedbackInput!) {
    createFeedback(input: $input) { id comment userEmail createdAt }
  }
`
const listFeedbackQuery = /* GraphQL */ `
  query ListFeedbacks {
    listFeedbacks(limit: 200) {
      items { id comment userEmail createdAt owner }
    }
  }
`
const deleteFeedbackMutation = /* GraphQL */ `
  mutation DeleteFeedback($input: DeleteFeedbackInput!) {
    deleteFeedback(input: $input) { id }
  }
`

export interface FeedbackItem {
  id: string
  comment: string
  userEmail?: string
  createdAt: string
  owner?: string
}

export async function postFeedback(comment: string, userEmail?: string): Promise<FeedbackItem> {
  const result = await client.graphql({
    query: createFeedbackMutation,
    variables: { input: { comment, userEmail } },
  }) as any
  return result.data.createFeedback
}

export async function listFeedback(): Promise<FeedbackItem[]> {
  const result = await client.graphql({ query: listFeedbackQuery }) as any
  const items: FeedbackItem[] = result.data?.listFeedbacks?.items ?? []
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function deleteFeedback(id: string): Promise<void> {
  await client.graphql({ query: deleteFeedbackMutation, variables: { input: { id } } })
}
