import { ApolloServer, UserInputError, gql, AuthenticationError }  from 'apollo-server'
import {  ApolloServerPluginLandingPageGraphQLPlayground} from "apollo-server-core";
import { 	v1 as uuid } from 'uuid'
import  mongoose from 'mongoose'
import Author from './models/author.js'
import User from './models/user.js'
import Book from './models/book.js'
import jwt from 'jsonwebtoken'
import  dotenv from 'dotenv'


dotenv.config()


const MONGODB_URI = process.env.MONGODB_URI 
const JWT_SECRET =  process.env.JWT_SECRET 


console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })





const typeDefs = gql`

	type Book {
		title: String!
		published: Int!
		author: Author!
		genres: [String!]!
		id: ID!
	}

	type Author{
		name: String!
		id: ID!
		born: Int
		bookCount: Int
	}

	type User {
		username: String!
		favoriteGenre: String
		id: ID!
	}

	type Token {
		value: String!
	}



	type Query {
		bookCount: Int!
		authorCount	: Int!
		allBooks(author: String, genre: String): [Book!]!
		booksByGenre(genre: String): [Book!]!
		allAuthors:  [Author!]!
		me: User
	}

	type Mutation {
		addBook(
			title: String!
			published: Int!
			author: String!
			genres:  [String!]
		): Book

		editAuthor(
			name: String!			
			setBornTo: Int!
		): Author

		addAuthor(
			name: String!
			born: Int		
		): Author

		createUser(
			username: String!
			favoriteGenre: String
		): User

		login(
			username: String!
			password: String!
		): Token

	
	}

`

const resolvers = {
	Query: {
		bookCount: () => Book.collection.countDocuments(),
		authorCount: () =>  Author.collection.countDocuments(),
		booksByGenre: async (root, args) => {
			if (args.genre === "all") {
				return await Book.find({}).populate('author')
			}
			return await  Book.find( { genres: { $in: [ args.genre ] } }, { _id: 0 } ).populate('author')
		},
		allBooks: async (root, args) => {	
			if (!args.author && !args.genre) {
				return await Book.find({}).populate('author')
			}
			
			const author = await Author.findOne({ name: args.author })
			
			return args.author && args.genre
				? await  Book.find( { author: { $in: [ args.author ] } }, { _id: 0 } ).populate('author')
				: args.genre 
					? await  Book.find( { genres: { $in: [ args.genre ] } } ).populate('author')
					: await  Book.find( { author: author._id  } ).populate('author')
		},	
		allAuthors: async (root, args) => {	
			return  await Author.find({})		
		},
	    me: (root, args, context) => {
			return context.currentUser
		}
	},
	Mutation: {
		addBook: async (root, args, { currentUser }) => {
			if (!currentUser) {
				throw new AuthenticationError("not authenticated")
			}
			let author
			author = await Author.findOne({ name: args.author })			
			if(!author){
				author = new Author({ name: args.author, bookCount: 1 })
				author.save()
			}
			
			const book =  new Book({ 
				title: args.title,
				author: author,
				published: args.published,
				genres: args.genres
			})

			const savedBook = book.save()		
			await Author.findByIdAndUpdate( author._id, { bookCount: (author.bookCount || 0) + 1 } )
			return await Book.populate(savedBook, { path: "author" })
		
	
		},	

		editAuthor: async (root, args, { currentUser }) => {	
			if (!currentUser) {
				throw new AuthenticationError("not authenticated")
			}
					
			const author = await Author.findOne({ name: args.name })
			if (!author) {
				throw new UserInputError("author name does not exist")
				return null
			}		
      		return  await Author.findByIdAndUpdate(author._id, { born: args.setBornTo }, {new:true})
		} ,

		addAuthor: (root, args) => {			
			const author =  new Author({ ...args })	
			return author.save().catch(error => {
				throw new UserInputError(error.message, {
					invalidArgs: args,
			})
		})
		},	

		createUser: (root, args) => {
			const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })

			return user.save()
			.catch(error => {
				throw new UserInputError(error.message, {
					invalidArgs: args,
				})
			})
		},

		login: async (root, args) => {
			const user = await User.findOne({ username: args.username })

			if ( !user || args.password !== 'secret' ) {
				throw new UserInputError("wrong credentials")
			}

			const userForToken = {
				username: user.username,
				id: user._id,
			}

			return { value: jwt.sign(userForToken, JWT_SECRET) }
		},
		
	}
}


const server = new ApolloServer({
  typeDefs,
  resolvers,
   plugins: [
    ApolloServerPluginLandingPageGraphQLPlayground(),
  ],  
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
	
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
	
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})