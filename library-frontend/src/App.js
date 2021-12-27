
import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import LoginForm from './components/LoginForm'
import NewBook from './components/NewBook'
import {   useApolloClient } from '@apollo/client'
import Notify from './components/Notify'
import RecommendedBooks from './components/RecommendedBooks'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const client = useApolloClient()
  const [errorMessage, setErrorMessage] = useState(null)

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
	setPage('authors')
  }

	const notify = (message) => {
		setErrorMessage(message)
		setTimeout(() => {
			setErrorMessage(null)
		}, 10000)
	}







  return (
    <div>
		<Notify errorMessage={errorMessage} />
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
		{token && 
			<>
				<button onClick={() => setPage('add')}>add book</button>
				<button onClick={() => setPage('recommend')}>recommend</button>
				<button onClick={logout}>logout	</button>
			</>
		}
		{!token &&  <button onClick={() => setPage('login')}>login	</button> }
     
      </div>

	  
      <Authors setError={notify}
        show={page === 'authors'}
		token={token}
      />

      <Books
        show={page === 'books'}
      />

	  <RecommendedBooks
        show={page === 'recommend'}
      />

      <NewBook
        show={page === 'add'}
      />

	   <LoginForm
	   		show={page === 'login'}
			setToken={setToken}
			setError={notify}
			errorMessage={errorMessage}
        />

    </div>
  )
}

export default App