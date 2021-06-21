import React from 'react'

import firebase from 'firebase/app'
import '../chat.css'
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/analytics'
import {SignIn} from './Bygoogle'

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { useRef, useState } from 'react';

var correo = ''
var usuarioChatId = ''
const auth = firebase.auth()
const firestore = firebase.firestore()
const analytics = firebase.analytics()
export const Chat =  () => {

  const [user] = useAuthState(auth)
  const [sala, salaprivada] = useState('messages')
  return (
    <div>

      <section>
        { user ?<><Chatroom sala={sala} salaprivada={salaprivada} /><GetUsers sala = {sala} salaprivada={salaprivada} /> </>: <SignIn />}
      </section>
    </div>
  );
}

function Usuarios(props){
  const {uid,displayName,lasttime,photoURL} = props.usuario
  if (uid === auth.currentUser.uid) {
       return(<></>)
  }
  const ultima = new Date(lasttime.seconds*1000)
  console.log(ultima)
  usuarioChatId = uid
  if(uid!==auth.currentUser.uid){
    return(<>
        <div id={uid} className="d-flex bd-highlight" onClick={ async (ee) =>{
          //console.log(ee.target.id, auth.currentUser.uid, ee, props.sala, props.salaprivada)
          ordenSala(ee.target.id, auth.currentUser.uid, ee, props.sala, props.salaprivada)
          firestore.collection('usuarios').where('uid', "==", ee.target.id).get().then((query) =>{
              const arr = query.docs[0]
              console.log(arr.data().photoURL)

          })
        }}>
          <div className="img_cont">
            <img id={uid} src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} className="rounded-circle user_img" />
            <span className="online_icon" />
          </div>
          <div className="user_info">
            <span id={uid}>
              {displayName}
            </span>
          </div>
        </div>
        
        {/*ultima.toLocaleString()*/}

    </>)
  }
}

function ordenSala(targetid, myid, e, sala, salaprivada){

  const concatenacion = firestore.collection(e.target.id+auth.currentUser.uid)
  const reverseconcatenacion = firestore.collection(auth.currentUser.uid+e.target.id)
  const {uid,photoURL} = auth.currentUser


  firebase.firestore().collection(targetid+myid).get()
    .then((snap) => {
      if(!snap.empty) {

        salaprivada(targetid+myid)

      } else {

        firebase.firestore().collection(myid+targetid).get()
        .then((snap2) => {
          if(!snap2.empty) {
            salaprivada(myid+targetid)
          }
          else if(snap.empty){
            concatenacion.add({
              text: 'inicio de chat',
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
              uid,
              photoURL
            })

            salaprivada(targetid+myid)
          } else {
            reverseconcatenacion.add({
              text: 'inicio de chat',
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
              uid,
              photoURL
            })

            salaprivada(myid+targetid)
          }
        })
      }
    })


}





const GetUsers = (props) =>{
  const usuariosRef = firestore.collection('usuarios')
  const query = usuariosRef.orderBy('lasttime').limit(25)
  const [usuarios] = useCollectionData(query, {idField:'id'})
  return(<>
    <div>
      {usuarios && usuarios.map(user => <Usuarios key={user.id} usuario = {user} sala={props.sala} salaprivada={props.salaprivada}/>)}
    </div>
  </>)
}


function Chatroom(props){
  const [user] = useAuthState(auth)
  const {uid, photoURL, createdAt} = auth.currentUser
  const dummy = useRef()
  const messageRef = firestore.collection(props.sala)
  const query = messageRef.orderBy('createdAt').limit(25)
  const [messages] = useCollectionData(query, {idField: 'id'})

  const [formValue,setFormValue] = useState('')

  const sendMessage = async (e) =>{

    e.preventDefault()
    const {uid, photoURL, createdAt} = auth.currentUser

    await messageRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('')
    dummy.current.scrollIntoView({ behaviour: 'smooth'})

  }
  return(<>
    <div>
      <link href="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css" rel="stylesheet" id="bootstrap-css" />
      {/*---- Include the above in your HEAD tag --------*/}
      <title>Chat</title>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossOrigin="anonymous" />
      <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.5.0/css/all.css" integrity="sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU" crossOrigin="anonymous" />
      <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/malihu-custom-scrollbar-plugin/3.1.5/jquery.mCustomScrollbar.min.css" />
      {/*Coded With Love By Mutiullah Samim*/}
      <div className="container-fluid h-100">
        <div className="row justify-content-center h-100">
          <div className="col-md-4 col-xl-3 chat"><div className="card mb-sm-3 mb-md-0 contacts_card">
              <div className="card-header">
                <div className="input-group">
                  <input type="text" placeholder="Search..." name className="form-control search" />
                  <div className="input-group-prepend">
                    <span className="input-group-text search_btn"><i className="fas fa-search" /></span>
                  </div>
                </div>
              </div>
              <div className="card-body contacts_body">
                <ul className="contacts">
                  <li className="active">
                    
                    <div id='general' className="d-flex bd-highlight">
                      <div className="img_cont">
                        <img src={photoURL} className="rounded-circle user_img" />
                        <span className="online_icon" />
                      </div>
                      <div className="user_info">
                        <span id='general'>{/*user.displayName*/}Grupo</span>
                        {/*<p>{user.displayName} is Online</p>*/}
                      </div>
                    </div>
                  </li>
                  <li className="active">
                    <GetUsers sala={props.sala} salaprivada={props.salaprivada}/>
                  </li>
                </ul>
              </div>
              <div className="card-footer" />
            </div></div>
          <div className="col-md-8 col-xl-6 chat">
            <div className="card">
              <div className="card-header msg_head">
                <div className="d-flex bd-highlight">
                  <div className="img_cont">
                    <img src={photoURL} className="rounded-circle user_img" />
                    <span className="online_icon" />
                  </div>
                  <div className="user_info">
                    <span>{/*user.displayName*/}Grupo</span>
                    <p>Messages</p>
                  </div>
                  <div className="video_cam">
                    <span><i className="fas fa-video" /></span>
                    <span><i className="fas fa-phone" /></span>
                  </div>
                </div>
              </div>
              <div className="card-body msg_card_body">
                <main>
                  {messages && messages.map(msg => <ChatMessage key = {msg.id} message= {msg} />)}
                  <span ref= {dummy}></span>
                </main>
              </div>
              <form onSubmit={sendMessage}>
                <div className="card-footer">
                  <div className="input-group">
                    <textarea name className="form-control type_msg" placeholder="Type your message..." defaultValue={""} value= {formValue} onChange= { (e) => setFormValue(e.target.value)} required/>
                    <div className="input-group-append">
                      <span className="input-group-text send_btn" >
                        <button type='submit' className="btn btn-primary" background-color="black" >
                          <i className="fas fa-location-arrow" />
                        </button>
                      </span>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>)
}



function SignOut(){

  return auth.currentUser && (
    <button className="sign-out" onClick = {() => auth.signOut() }> Salir </button>
  )
}

function ChatMessage(props){
  correo = auth.currentUser
  const {text, uid, photoURL, createdAt} = props.message

  const messageClass = uid == auth.currentUser.uid ? 'sent': 'received'
  const time = createdAt ? createdAt.toDate().toLocaleTimeString() : null
  const date = createdAt ? createdAt.toDate().toDateString() : null
  
  if(messageClass == 'received'){
    return(<>
      <div className = 'd-flex justify-content-start mb-4' >
        <div className="img_cont_msg">
            <img src={photoURL} className="rounded-circle user_img_msg" />
        </div>
        <div className = 'msg_cotainer_send' >
          {text} 
          <span className="msg_time_send">{time}</span>
        </div>
        
      </div>
    </>)
  }

  if(messageClass == 'sent'){
    return(<>
      <div className = 'd-flex justify-content-end mb-4' >
        <div className = 'msg_cotainer' >
          {text} 
          <span className="msg_time">{time}</span>
        </div>
        <div className="img_cont_msg">
          <img src={photoURL} className="rounded-circle user_img_msg" />
        </div>
      </div>
    </>)
  }
}