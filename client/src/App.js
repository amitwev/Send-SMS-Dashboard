import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const [blockSubmitButton, setBlockSubmitButton] = useState(false)
  const [sendSMSMessage, setSendSMSMessage] = useState({ message: '', valid: false });
  const [messageHistoryNumber, setMessageHistoryNumber] = useState(0);
  const [messagesHistory, setMessagesHistory] = useState(null);
  const [textAreaLength, setTextAreaLength] = useState(0)

  useEffect(() => {
    fetchData('/messages_history', {method: "GET"}, handleHistoryMessages)
  }, [blockSubmitButton])

  const handleHistoryMessages = function(data){
    setMessagesHistory(data);
    setMessageHistoryNumber(Object.keys(data).length); 
  } 

  const validateInputs = (message, number) => {
    return message.length > 0 && validatePhoneNumber(number);
  }

  const validatePhoneNumber = (num) => {
    var re = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g;
    return re.test(num);
  }
  const buildBody = (message, number) => {
    return {
      'phoneNumber': number,
      'body': message,
    }
  }

  const sendMessageResponseHandler = (data) => {
    const status = data.status;
    setSendSMSMessage(prev => ({ ...prev, message: data.body }))
    switch (status) {
      case 'ok':
        setSendSMSMessage(prev => ({ ...prev, valid: true }));
        break;
      case 'bad':
        setSendSMSMessage(prev => ({ ...prev, valid: false }));
        break;
      default:
        break;
    }
  }
  const fetchData = async (url, options, successCallback, finallyCallback) => {
    try {
      fetch(url, options)
        .then(result => {
          return result.json();
        })
        .then(data => successCallback(data))
        .catch(err => {
          console.log(`err on fetching data: ${err}`)
        })
        .finally(() =>  finallyCallback ? finallyCallback() : null
        )
    } catch (err) {
      console.log(`Err: ${err}`);
    }
  }
  const sendMessage = async () => {
    const message = document.querySelector('.phone__message').value;
    const phoneNumber = document.querySelector('.phone__input').value;
    if (!validateInputs(message, phoneNumber)) {
      return sendMessageResponseHandler({status: "bad", body: "Please check phone and message"})
    }
    setBlockSubmitButton(true);
    const url = '/send_SMS'
    let body = buildBody(message, phoneNumber);
    fetchData(url, 
      { 
        method: "POST",
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(body)
      }, 
      sendMessageResponseHandler,
      function(){
      setBlockSubmitButton(false)
    });

  }

  const resetForm = () => {
    const message = document.querySelector('.phone__message');
    const phone = document.querySelector('.phone__input');
    message.value = '';
    phone.value = ''
  }

  const handleTextAreaInput = (event) => {
    event.preventDefault();
    const maxLength = 250; 
    const value = event.target.value.slice(0, maxLength); 
    setTextAreaLength(value.length);
    if(value.length > 250){
      return; 
    }
    event.target.value = value;
  }

  return (
    <div id="main">
      <h1>My SMS Messenger</h1>
      <div className="container">

        <div className="new__message">
          <div className="title">New message</div>
          <div className="phone__number inputs__container">
            <label htmlFor="number">Phone number</label>
            <input type="text" className="phone__input" />
          </div>
          <div className="message__container inputs__container" >
            <label htmlFor="">Message</label>
            <textarea type="textArea" className="phone__message" rows="4" cols="10" onChange={ handleTextAreaInput}/>
            <span className="text_area_length">{`${textAreaLength}/ 250`}</span>
          </div>
          <div className={`response__SMS_message ${sendSMSMessage.valid ? 'valid' : 'failed'} `}  >{sendSMSMessage.message}</div>
          <div className="cta">
            <button className="clear btn" onClick={resetForm}>Clear</button>
            <button className="Submit" onClick={sendMessage} disabled={blockSubmitButton ? 'disabled' : ''}>Submit</button>
          </div>
        </div>
        <div className="message__history">
          <div className="title">Message history {messageHistoryNumber} </div>
          <div className="messages__container">
          {
            messagesHistory ? Object.keys(messagesHistory).map((item, index) => {
              return(
                <div className="message" key={index}>
                  <div className="message__details">
                    <div className="phone">{messagesHistory[item].phone}</div>
                    <div className="date">{messagesHistory[item].date}</div>
                  </div>
                  <div className="data"><span>{messagesHistory[item].message}</span></div>
                </div>
              ) 
            }) : null
          }
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
