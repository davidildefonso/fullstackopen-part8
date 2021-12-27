import { gql } from '@apollo/client'

export const CREATE_BOOK = gql`
mutation createBook($title: String!, $author: String!, $published: Int!, $genres: [String!]) {
	addBook(
			title: $title,
			author: $author,
			published: $published,
			genres: $genres
		) {
			title,
			author {
				name,
				bookCount
			},
			published,
			genres
			id
		}

}


`



export const ALL_AUTHORS = gql`
	query authors {
		allAuthors { 
			name
			born
			bookCount
			
		}
	}

`


export const FIND_AUTHOR = gql`
	query findAuthorByName($nameToSearch: String!) {
		findAuthor(name: $nameToSearch) {
			name
			born 
			bookCount 
		}
	}

`

export const FIND_BOOK = gql`
	query findBookByTitle($nameToSearch: String!) {
		findBook(name: $nameToSearch) {
			title
			published 
			author 
		}
	}

`



export const EDIT_BORNYEAR = gql`
mutation editBornYear($name: String!, $born: Int!){
	editAuthor(
			name: $name,
			setBornTo: $born
		) {
			name,
			born,
			bookCount		
		}

}


`


export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`



export const USER = gql`
	query getUser{
		me{
			username,
			favoriteGenre
		}
	}
`

export const FIND_BOOKS_BY_GENRE = gql`
	query findBooksByGenre($genre: String!) {
		booksByGenre(genre: $genre) {
			title 
			author{
				name
				bookCount				
			}
			published 		
			genres	
			id
		}
	}

`

export const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    title 
	author{
		name
		bookCount				
	}
	published 		
	genres	
	id
  }
`


export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  
${BOOK_DETAILS}
`

export const ALL_BOOKS = gql`
	query books {
		allBooks { 
		   ...BookDetails	
		}
	}

	${BOOK_DETAILS}
`