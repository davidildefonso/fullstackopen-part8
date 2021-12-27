
import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import LoginForm from './components/LoginForm'
import NewBook from './components/NewBook'
import {  useQuery, useSubscription, useApolloClient } from '@apollo/client'
import Notify from './components/Notify'
import RecommendedBooks from './components/RecommendedBooks'
import { ALL_BOOKS, BOOK_ADDED } from './queries'

const App = () => {
	const result = useQuery(ALL_BOOKS )
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



	const updateCacheWith = (addedBook) => {
		
		const includedIn = (set, object) => 
			set.map(p => p.id).includes(object.id)  

		const dataInStore = client.readQuery({ query: ALL_BOOKS })
		
		if (!includedIn(dataInStore.allBooks, addedBook)) {
			
			client.writeQuery({
				query: ALL_BOOKS,
				data: { allBooks: dataInStore.allBooks.concat(addedBook) }
			})
		
		}   
	}


	useSubscription(BOOK_ADDED, {
		onSubscriptionData: ({ subscriptionData }) => {
			
			const addedBook = subscriptionData.data.bookAdded
			notify(`${addedBook.title} added`)
			updateCacheWith(addedBook)
		}
	})


	if (result.loading) {
		return <div>loading...</div>
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
		books= {result.data.allBooks}
		loading = {result.loading}
      />

	  <RecommendedBooks
        show={page === 'recommend'}
      />

      <NewBook
        show={page === 'add'} updateCacheWith ={updateCacheWith}
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