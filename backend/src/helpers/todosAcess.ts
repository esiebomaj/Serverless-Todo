import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')
const todoIdIndex = process.env.TODOS_CREATED_AT_INDEX

// TODO: Implement the dataLayer logic

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todoTable = process.env.TODOS_TABLE
  ) {}

  async getAllTodoItems(userId: string): Promise<TodoItem[]> {
    console.log('Getting all todos')
    logger.info('Getting all todos', { userId })

    const result = await this.docClient
      .query({
        TableName: this.todoTable,
        IndexName: todoIdIndex,
        KeyConditionExpression: 'userId = :paritionKey',
        ExpressionAttributeValues: {
          ':paritionKey': userId
        }
      })
      .promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodoItem(todo: TodoItem): Promise<TodoItem> {
    logger.info('Creating new todo', { name: todo.name, todoId: todo.todoId })
    await this.docClient
      .put({
        TableName: this.todoTable,
        Item: todo
      })
      .promise()

    return todo
  }

  async updateTodoItem(todo: TodoUpdate, todoId: string, userId: string) {
    logger.info('Updating todo', { todoId })
    const params = {
      TableName: this.todoTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      UpdateExpression: 'set dueDate=:a, #nameAtt=:n, done=:d',
      ExpressionAttributeValues: {
        ':a': todo.dueDate,
        ':n': todo.name,
        ':d': todo.done
      },
      ExpressionAttributeNames: {
        '#nameAtt': 'name'
      },
      ReturnValues: 'UPDATED_NEW'
    }

    await this.docClient.update(params).promise()
  }

  async deleteTodoItem(todoId: string, userId: String) {
    logger.info('Deleting todo', { todoId })
    const params = {
      TableName: this.todoTable,
      IndexName: todoIdIndex,
      Key: {
        userId: userId,
        todoId: todoId
      }
    }

    await this.docClient.delete(params).promise()
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
