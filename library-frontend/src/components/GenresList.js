import React , { useEffect}  from 'react'
import { useLazyQuery  } from '@apollo/client'
import { FIND_BOOKS_BY_GENRE } from '../queries'


const GenresList = ({  genres, setBooks}) => {


	const [getBooks, result] = useLazyQuery(FIND_BOOKS_BY_GENRE) 

	const showBooks = (genre) => {	
		getBooks({ variables: { genre } })
	}
	
	useEffect(() => {		
		if (result.data) {
			setBooks(result.data.booksByGenre)
		}
	}, [result.data]) // eslint-disable-line

	return (
		<div>
			{genres.map( (genre, index) => 
				<button 
					key = {Math.random() * index * 9999999} 
					onClick={() => showBooks(genre)}>{genre} </button> )}	
			<button onClick={() => showBooks('all')}>all</button>
		</div>

	)
}


export default GenresList