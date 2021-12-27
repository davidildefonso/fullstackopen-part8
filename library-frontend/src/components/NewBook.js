import React, { useState } from 'react'
import { useQuery, useMutation, useSubscription, useApolloClient   } from '@apollo/client'
import { CREATE_BOOK, ALL_BOOKS, ALL_AUTHORS, FIND_BOOKS_BY_GENRE , BOOK_ADDED} from '../queries'

const NewBook = (props) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const [ createBook ] = useMutation(CREATE_BOOK , {		
		onError: (error) => {
			console.log(error)
		},		
		update: (store, response) => {
		
			props.updateCacheWith(response.data.addBook)

			const dataInStoreAuthors = store.readQuery({ query: ALL_AUTHORS })			
			store.writeQuery({
				query: ALL_AUTHORS,
				data: {
					...dataInStoreAuthors.allAuthors,
					allAuthors: dataInStoreAuthors.allAuthors.map(author => 
						author._id === response.data._id 
							? {...author, bookCount: author.bookCount + 1 } 
							: author
					) 
				}
			})

		}		
		// update: (store, response) => {
		// 	const dataInStore = store.readQuery({ query: ALL_BOOKS })
		// 	store.writeQuery({
		// 		query: ALL_BOOKS,
		// 		data: {
		// 			...dataInStore,
		// 			allBooks: [ ...dataInStore.allBooks, response.data.addBook ]
		// 		}
		// 	})

		// 	const dataInStoreAuthors = store.readQuery({ query: ALL_AUTHORS })
			
		// 	store.writeQuery({
		// 		query: ALL_AUTHORS,
		// 		data: {
		// 			...dataInStoreAuthors.allAuthors,
		// 			allAuthors: dataInStoreAuthors.allAuthors.map(author => 
		// 				author._id === response.data._id 
		// 					? {...author, bookCount: author.bookCount + 1 } 
		// 					: author
		// 			) 
		// 		}
		// 	})

		// 	// const dataInStoreFilter = store.readQuery({ 
		// 	// 	query: FIND_BOOKS_BY_GENRE, 
		// 	// 	variables: { genre: response.data.addBook.genres[0] } 
		// 	// })			
		// 	// store.writeQuery({
		// 	// 	query: FIND_BOOKS_BY_GENRE,
		// 	// 	data:  {
		// 	// 		...dataInStore,
		// 	// 		booksByGenre: [ ...dataInStoreFilter.booksByGenre, response.data.addBook ]
		// 	// 	}
		// 	// })


		
			
		// }
	})


	
	useSubscription(BOOK_ADDED, {
		onSubscriptionData: ({ subscriptionData }) => {
			  console.log(subscriptionData)
			// const addedBook = subscriptionData.data.bookAdded
			// notify(`${addedBook.name} added`)
			// updateCacheWith(addedBook)
		}
	})



  if (!props.show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()
    
   	createBook({  variables: { title, author, published, genres } })
	

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type='number'
            value={published}
            onChange={({ target }) => setPublished(Number(target.value))}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">add genre</button>
        </div>
        <div>
          genres: {genres.join(' ')}
        </div>
        <button type='submit'>create book</button>
      </form>
    </div>
  )
}

export default NewBook
