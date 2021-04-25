import React, { useMemo, useState,useEffect, useRef  } from 'react'
import { createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import initialValue from './SlateInitialValue'
import io from "socket.io-client"

const socket = io("http://localhost:8080");

const SlateEditor = () => {
  const editor = useMemo(() => withReact(createEditor()), [])
  const remote = useRef(false);
  const id = useRef(); //create a new user id for each editor
  const [value, setValue] = useState(initialValue)
  
  const[edit,setEdit] =useState(true); //setting the edit into state and enabling it once all the users have joined the game
  const[serverMessage,setServerMessage] =useState("Messages from the server"); //To Display messages from the server

  /**
   * on every event emeitted from server check if the Id coming from server matches the 
   * current id of the editor. if its coming from the other editor set the text into the current editor.
   */
  useEffect(() => {
    //when connection is opened set the current id as the id provided from the socket/server so as to check if its your turn or not
    socket.on("connect", () => {
      id.current = socket.id;
  });
  
  //if user turn event is received check if this is your turn if not set message as Game in progress
  socket.on(
    "user-turn",
    ({socket,msg}) => {
      if (id.current === socket) {
        remote.current = true;
        setEdit(false);
        setServerMessage(msg);
       remote.current = false;
      }
      else{
        setServerMessage("Game in Progress");
      }
    }
  );

    //if new remote operation event is received check if this is your event if not set content to the editor
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

    socket.on("message", (msg) => {
      setServerMessage(msg)
  });
  

  socket.on("start", (msg) => {
    setEdit(msg)
});

socket.on("game-over", () => {
  setEdit(true);
  setServerMessage("Game Over");
  socket.emit("end")
});

    socket.on("error", (msg) => {
      setServerMessage(msg)
  }); 

  }, [editor]);


  return (
    <>
    <h1>{serverMessage}</h1>
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
      <Editable readOnly={edit}/>
    </Slate>


    </>
  )

}

export default SlateEditor;
