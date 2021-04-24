import React, { useMemo, useState } from 'react'
import { createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import initialValue from '../src/Componenets/SlateInitialValue'



function App() {
  const memo = useMemo(() => withReact(createEditor()), [])
    // Add the initial value when setting up our state.
    const [value, setValue] = useState(initialValue)
    
 


  return (
    <>
    <Slate
      editor={memo}
      value={value}
      onChange={newValue => {
          setValue(newValue)}}
    >
      <Editable />
    </Slate>


    </>
  )

}

export default App;
