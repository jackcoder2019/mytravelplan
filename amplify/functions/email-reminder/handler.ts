import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

const ses = new SESClient({})
const dynamo = new DynamoDBClient({})
const TABLE = process.env.ITINERARY_TABLE_NAME ?? ''

interface Event {
  email: string
  subject: string
  body: string
  itineraryId: string
  transportId: string
}

export const handler = async (event: Event) => {
  const { email, subject, body, itineraryId, transportId } = event
  let finalStatus: 'sent' | 'failed' = 'sent'

  try {
    await ses.send(new SendEmailCommand({
      Source: email,
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: subject },
        Body: { Text: { Data: body } },
      },
    }))
  } catch (e) {
    console.error('SES send failed', e)
    finalStatus = 'failed'
  }

  // Update reminder status in DynamoDB
  try {
    const { Item } = await dynamo.send(new GetItemCommand({
      TableName: TABLE,
      Key: marshall({ id: itineraryId }),
    }))
    if (!Item) return

    const record = unmarshall(Item)
    const itinerary = JSON.parse(record.data)

    itinerary.days = itinerary.days.map((day: any) => ({
      ...day,
      transportation: (Array.isArray(day.transportation) ? day.transportation : []).map((t: any) =>
        t.id === transportId
          ? { ...t, reminder: { ...t.reminder, status: finalStatus } }
          : t
      ),
    }))

    await dynamo.send(new PutItemCommand({
      TableName: TABLE,
      Item: marshall({ ...record, data: JSON.stringify(itinerary) }),
    }))
  } catch (e) {
    console.error('DynamoDB update failed', e)
  }
}
