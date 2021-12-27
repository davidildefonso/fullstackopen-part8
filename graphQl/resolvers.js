import { PubSub } from 'graphql-subscriptions';
import Author from './models/author.js'
import Book from './models/book.js'
import User from './models/user.js'
import {  UserInputError,  AuthenticationError }  from 'apollo-server-express'
import jwt from 'jsonwebtoken'
import  dotenv from 'dotenv'

dotenv.config()

const pubsub = new PubSub();
const JWT_SECRET =  process.env.JWT_SECRET 


export const resolvers = {
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

			try {			
				author = await Author.findOne({ name: args.author })			
		
			} catch (error) {
				throw new UserInputError(error.message, {
					invalidArgs: args,
				})
			}

			try {
				if(!author){
					author = new Author({ name: args.author, bookCount: 1 })
					author.save()
				}			
			} catch (error) {
				throw new UserInputError(error.message, {
					invalidArgs: args,
				})
			}					
				
			const book =  new Book({ 
				title: args.title,
				author: author,
				published: args.published,
				genres: args.genres
			})

			const savedBook = book.save()	
			

			try {
				await Author.findByIdAndUpdate( author._id, { bookCount: (author.bookCount || 0) + 1 } )			
			} catch (error) {
				throw new UserInputError(error.message, {
					invalidArgs: args,
				})
			}

			pubsub.publish('BOOK_ADDED', { bookAdded: book })
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
		
	},
	Subscription: {
		bookAdded: {
			subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
		},
	},
	
}
