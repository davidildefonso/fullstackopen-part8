import React, {useState} from 'react'
import {  useQuery  } from '@apollo/client'
import { ALL_BOOKS } from '../queries'
import GenresList from './GenresList'


const Books = (props) => {
	const result = useQuery(ALL_BOOKS )
	const [booksFiltered, setBooksFiltered] = useState(null)

	if (props.show && result.loading) {
		return <div>loading...</div>
	}

  if (!props.show) {
    return null
  }

  const books =  result.data.allBooks 

  const genres = books.reduce( (filteredGenres, book) => {
	book.genres.forEach(element => {
		if(!filteredGenres.includes(element)) filteredGenres.push(element)
	});	
	return filteredGenres
  }, [])


	const booksToShow = () => {
		const filtered = booksFiltered ? booksFiltered : books
		return (
			filtered.map(a =>
				<tr key={a.title}>
					<td>{a.title}</td>
					<td>{a.author.name}</td>
					<td>{a.published}</td>
				</tr>
			)
		)
	}
		

  return (
    <div>
      <h2>BOOKS</h2>
		<GenresList  books={books} genres={genres} setBooks={setBooksFiltered} />
	
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {booksToShow()}
        </tbody>
      </table>
    </div>
  )
}

export default Books