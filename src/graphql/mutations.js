/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createTodo = `mutation CreateTodo(
  $input: CreateTodoInput!
  $condition: ModelTodoConditionInput
) {
  createTodo(input: $input, condition: $condition) {
    id
    clientId
    name
    description
    completed
  }
}
`;
export const updateTodo = `mutation UpdateTodo(
  $input: UpdateTodoInput!
  $condition: ModelTodoConditionInput
) {
  updateTodo(input: $input, condition: $condition) {
    id
    clientId
    name
    description
    completed
  }
}
`;
export const deleteTodo = `mutation DeleteTodo(
  $input: DeleteTodoInput!
  $condition: ModelTodoConditionInput
) {
  deleteTodo(input: $input, condition: $condition) {
    id
    clientId
    name
    description
    completed
  }
}
`;
