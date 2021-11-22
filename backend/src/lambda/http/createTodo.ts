import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'
import { createTodo } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'
const logger = createLogger('handler')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    logger.info('Create Todo Request Recieved', { name: newTodo.name })
    // TODO: Implement creating a new TODO item

    const userId = getUserId(event)
    const createdTodo = await createTodo(newTodo, userId)

    return {
      statusCode: 201,
      body: JSON.stringify({ item: createdTodo })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
