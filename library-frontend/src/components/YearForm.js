import React, { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'

import { EDIT_BORNYEAR, ALL_AUTHORS } from '../queries'

const YearForm = ( {setError , authors }) => {
  const [name, setName] = useState('')
  const [year, setYear] = useState('')

  const [ changeYear, result  ] = useMutation(EDIT_BORNYEAR,  {
		refetchQueries: [ { query: ALL_AUTHORS } ],
		onError: (error) => {
			setError(error.graphQLErrors[0].message)
		}
	})

  const submit = (event) => {
    event.preventDefault()

    changeYear({ variables: { name, born: year } })

    setName('')
    setYear('')
  }

   useEffect(() => {
		if (result.data && result.data.editNumber === null) {
			setError('author not found')
		}
	}, [result.data])  // eslint-disable-line

  return (
    <div>
      <h2>change born year</h2>

      <form onSubmit={submit}>
        <div>
          author 
		  <select  value={name} onChange={({ target }) => setName(target.value)} >
		  			<option value = "" >Select author</option>
		  	{authors && authors.map((a, i) => 
					<option  key={Math.random()*i * 10000} value={a.name} >{a.name} </option>
			)}
		  </select>         
        </div>
        <div>
          Born year <input
            value={year}
            onChange={({ target }) => setYear(Number(target.value))}
          />
        </div>
        <button type='submit'>change year</button>
      </form>
    </div>
  )
}

export default YearForm