import { TodoAccess } from './todosAcess'
import { getSignedUploadUrl } from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'
// import { String } from 'aws-sdk/clients/appstream'

const todoAccess = new TodoAccess()
const bucketName = process.env.ATTACHMENT_S3_BUCKET

// TODO: Implement businessLogic
export const getTodosForUser = async (userId: string): Promise<TodoItem[]> => {
  const todos = await todoAccess.getAllTodoItems(userId)
  return todos
}

export const createTodo = async (
  newTodo: CreateTodoRequest,
  userId: string
): Promise<TodoItem> => {
  const createdAt = new Date().toISOString()
  const todoId = uuid.v4()
  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`
  const todo = await todoAccess.createTodoItem({
    todoId,
    userId,
    createdAt,
    attachmentUrl,
    done: false,
    ...newTodo
  })
  return todo
}

export const updateTodo = async (
  todo: UpdateTodoRequest,
  todoId: string,
  userId: string
) => {
  await todoAccess.updateTodoItem(todo, todoId, userId)
}

export const deleteTodo = async (todoId: string, userId: string) => {
  await todoAccess.deleteTodoItem(todoId, userId)
}

export const createAttachmentPresignedUrl = async (
  todoId: string
): Promise<string> => {
  return await getSignedUploadUrl(todoId)
}
