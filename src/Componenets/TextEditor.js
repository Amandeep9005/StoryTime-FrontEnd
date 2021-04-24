import React, {  useState ,useEffect} from 'react'
import io from "socket.io-client";
/**
 * 
 * @returns it return a textbox 
 */

const TextEditor = () => {
  const socket = io("http://localhost:8080");
  
    const [msg,setMsg] = useState();
  
     
    useEffect(() => {
      socket.on("message",text=>{
        
    console.log("inside UseEffecy",text) 
        setMsg(text);
      })

      return () => socket.disconnect();
    });    
  
  
    return (
      <>
     
      <textarea onChange={(e)=>{
        setMsg(e.target.value)}} >

      </textarea>
      <h1>{msg}</h1>
      <button  onClick={
        ()=>{
          console.log("in the buttn",msg)
          socket.emit("message",msg)}} 
        className={{width:"12px"}}></button>

      </>
    )
  }

  export default TextEditor;