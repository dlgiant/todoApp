import React, { useEffect, useReducer } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import uuid from 'uuid/v4';
import { List, Input, Button } from 'antd';
import 'antd/dist/antd.css';
import { listTodos } from './graphql/queries'
import { onCreateTodo } from './graphql/subscriptions'
import { updateTodo as UpdateTodo, createTodo as CreateTodo, deleteTodo as DeleteTodo } from './graphql/mutations';
import './App.css';

const CLIENT_ID = uuid();

const initialState = {
  notes: [],
  loading: true,
  error: false,
  form: { name: '', description: '' }
}

function reducer(state, action){
  switch(action.type){
    case 'SET_NOTES':
      return { ...state, notes: action.notes, loading: false };
    case 'ERROR':
      console.log("An error ocurred");
      return { ...state, loading: false, error: true };
    case 'ADD_NOTE':
      console.log("Adding note");
      return { ...state, notes: [action.notes, ...state.notes]};
    case 'RESET_FORM':
      console.log("Reseting form")
      return { ...state, form: initialState.form };
    case 'SET_INPUT':
      return { ...state, form: { ...state.form, [action.name]: action.value }};
    default:
      return state
  }
}


function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  async function fetchNotes(){
    try {
      const notesData = await API.graphql(graphqlOperation(listTodos));
      dispatch({ type: 'SET_NOTES', notes: notesData.data.listTodos.items });
    } catch (err){
      console.log('error', err);
      dispatch({ type: 'ERROR' });
    }
  }
 
  async function createTodo() {
    const { form } = state;

    if (!form.name || !form.description) return alert('please enter name and description');

    const note = { ...form, clientId: CLIENT_ID, completed: false };
    dispatch({ type: 'ADD_NOTE', note});
    dispatch({ type: 'RESET_FORM' });

    try {
      await API.graphql(graphqlOperation(CreateTodo, { input: note }))
      console.log('successfully created todo!')
    } catch (err) {
      console.log("error: ", err);
    }
  }

  async function deleteTodo({id }) {
    const index = state.notes.findIndex(n => n.id === id);
    const notes = [...state.notes.slice(0, index), ...state.notes.slice(index + 1)];
    dispatch({ type: 'SET_NOTES', notes });
    try {
      await API.graphql(graphqlOperation(DeleteTodo, { input: {id} }))
      console.log('successfully deleted note!');
    } catch (err) {
      console.log({ err });
    }
  }

  async function updateTodo(note) {
    const index = state.notes.findIndex(n => n.id === note.id)
    const notes = [...state.notes]
    notes[index].completed = !note.completed
    dispatch({ type: 'SET_NOTES', notes})
    try {
      await API.graphql(graphqlOperation(UpdateTodo, { input: notes[index] }))
      console.log('note successfully update!')
    } catch (err) {
      console.log('error: ', err)
    }
  }

  function onChange(e) {
    dispatch({ type: 'SET_INPUT', name: e.target.name, value: e.target.value })
  }

  useEffect(() => {
    fetchNotes()
    const subscription = API.graphql(graphqlOperation(onCreateTodo))
      .subscribe({
        next: noteData => {
          const note = noteData.value.data.onCreateTodo
          if (CLIENT_ID === note.clientId) return
          dispatch({ type: 'ADD_NOTE', note })
        }
      })
      return () => subscription.unsubscribe()
  }, [])

  const styles = {
    container: { padding: 20 },
    input: { marginBottom: 10 },
    item: { textAlign: 'left' },
    p: { color: '#1890ff' }
  }

  function renderItem(item){
    return (
        <List.Item 
          style={styles.item}
          actions={[
            <p style={styles.p} onClick={() => deleteTodo(item)}>Delete</p>,
            <p style={styles.p} onClick={() => updateTodo(item)}>
              {item.completed ? 'completed' : 'mark completed'}
            </p>
          ]}
        >
          <List.Item.Meta
            title={item.name}
            description={item.description}
          />
        </List.Item>
      )
  }

  return (
    <div style={styles.container}>
      <Input
        onChange={onChange}
        value={state.form.name}
        placeholder="Todo name"
        name='name'
        style={styles.input}
      />
      <Input
        onChange={onChange}
        value={state.form.description}
        placeholder="Todo Description"
        name='description'
        style={styles.input}
      />
      <Button
        onClick={createTodo}
        type='primary'
      >Create Todo</Button>
      <List
        loading={state.loading}
        dataSource={state.notes}
        renderItem={renderItem}
      />
    </div>
  );
}

export default App;
