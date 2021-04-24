import React, { useMemo, useState,useEffect, useRef  } from 'react'
import { createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import initialValue from './SlateInitialValue'
import io from "socket.io-client"

const socket = io("http://localhost:8080");

const SlateEditor = () => {
  const editor = useMemo(() => withReact(createEditor()), [])
  const remote = useRef(false);
  const id = useRef(`${Date.now()}`); //create a new user id for each editor
  const [value, setValue] = useState(initialValue)

  /**
   * on every event emeitted from server check if the Id coming from server matches the 
   *  current id of the editor. if its coming from the other editor set the text into the current editor.
   */
  useEffect(() => {
    socket.on(
      "new-remote-operations",
      ({editorId, ops}) => {
        if (id.current !== editorId) {
          remote.current = true;
          JSON.parse(ops).forEach((op) =>{
            editor.apply(op);
           }
         );
         remote.current = false;
        }
      }
    );

    socket.on("error", (msg) => {
      alert(msg);
  }); 

  }, [editor]);


  return (
    <>
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => {
        setValue(newValue);
        /**
         * Check what kind of operation user is performing is it actual typing and is there any data attaced with that operation.
         * If both conditions are yes eit that event to the Server
         */
        const ops = editor.operations
        .filter(o => {
          if (o) {
            return (
              o.type !== "set_selection" &&
              o.type !== "set_value" &&
              (!o.data || !o.data.hasOwnProperty("source"))
            );
          }

          return false;
        })
        .map((o) => ({ ...o, data: { source: "one" } }));

        if (ops.length && !remote.current) {
          socket.emit("new-operations", {
            editorId: id.current,
            ops: JSON.stringify(ops)
          });
        }
      }}
    >
      <Editable />
    </Slate>


    </>
  )

}

export default SlateEditor;