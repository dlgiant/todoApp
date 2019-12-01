/* src/Protected.js */
import React, { useEffect } from 'react';
import { Auth } from 'aws-amplify'
import Container from './Container'
import Todos from './Todos'

function Protected(props) {
	useEffect(() => {
		Auth.currentAuthenticatedUser()
			.catch(() => {
				props.setCurrent('profile')
				props.history.push('/profile')
			})		
	}, [])
	return (
		<Container>
			<Todos/>
		</Container>
	);
}

export default Protected
