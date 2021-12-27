import React from 'react'
import {  useQuery  } from '@apollo/client'
import { USER, ALL_BOOKS } from '../queries'




const RecommendedBooks = ({show }) => {
	
	const resultBooks = useQuery(ALL_BOOKS )
	const resultUser = useQuery(USER )	

	if (show && (resultBooks.loading || resultUser.loading )) {
		return <div>loading...</div>
	}

	if (!show) {
		return null
	}


  	const books =  resultBooks.data.allBooks	
	const genre =  resultUser.data.me.favoriteGenre


	const booksToShow = () => {	
	
		const filtered = books.filter(b => b.genres.includes(genre))

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
		
		<h4> Books recommended based on your favorite genre: "{genre}" </h4>
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

export default RecommendedBooks