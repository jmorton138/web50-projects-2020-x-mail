document.addEventListener('DOMContentLoaded', function() {

  
  
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

});

function reply(url) {
  fetch(url)
  .then(response => response.json())
  .then(email => {
  //reply button
      const reply = document.createElement('button');
      reply.innerHTML = `Reply`;
      reply.className ="btn btn-primary";
      reply.style.margin = "10px";
      document.querySelector('#container').append(reply);
      reply.onclick = () => {
      compose_email()
      const re = 'Re:';
      const subject = `${email.subject}`;
      document.querySelector('#compose-recipients').value = `${email.sender}`; 
      if (subject.startsWith(re)){
          document.querySelector('#compose-subject').value =`${email.subject}`;
      } else {
          document.querySelector('#compose-subject').value =`Re:${email.subject}`;
      }
      document.querySelector('#compose-body').value= `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;


      } 
  })
}
function unarchive(url) {
  fetch(url)
  .then(response => response.json())
  .then(email => {
      const button = document.createElement('button');
      button.innerHTML = `Unarchive`;
      button.className ="btn btn-primary";
      document.querySelector('#container').append(button);
      button.onclick = () => {
      fetch(url, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
  })
  button.innerHTML = `Unarchived`;
  }

})
}
function archive(url) {
  fetch(url)
  .then(response => response.json())
  .then(email => {
      const button = document.createElement('button');
      button.innerHTML = `Archive`;
      document.querySelector('#container').append(button);
      button.className ="btn btn-primary";
      button.onclick = () => {
      fetch(url, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
      })
      button.innerHTML = `Archived`;
      }

  })
  
}

function load_email(url) {
    fetch(url)
    .then(response => response.json())
    .then(email => {
  
    document.querySelector('#container').innerHTML = '';
    const from = document.createElement('div');
    from.className= "list-group-item";
    from.innerHTML = `<b>Email ID:</b> ${email.id} <b>From:</b> ${email.sender}   <b>To</b> : ${email.recipients} <b>Timestamp:</b> ${email.timestamp}`;
    const body = document.createElement('div');
    body.innerHTML = `${email.body}`;
    body.className = "list-group-item";
    //document.querySelector('#container').innerHTML = `${email.id} From: ${email.sender} To:  Body: ${email.body}`;
    document.querySelector('#container').append(from);
    document.querySelector('#container').append(body);

  })
  
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  document.querySelector('#container').innerHTML ='';
  // Send email
  document.querySelector('#compose-form').onsubmit = function() {

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value,
          read: false
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    });
  }  
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  if (mailbox == 'inbox') {
    document.querySelector('#container').innerHTML ='';
    //load emails
  fetch('/emails/inbox')
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);
    emails.forEach(function(value, index) {
     
      const element = document.createElement('div');
      const email_id = emails[index].id;
      element.innerHTML = `<b>Email ID:</b> ${email_id}   <b>From:</b> ${emails[index].sender} <b>Subject:</b> ${emails[index].subject} <b>Timestamp:</b> ${emails[index].timestamp}`;
      //element.style.border = "thin solid black";
      element.className = "list-group-item";
      if (emails[index].read == true) {
        element.style.backgroundColor = "white";
      } else {
        element.style.backgroundColor = "grey";
      }
      const url = `/emails/${email_id}`;
      element.addEventListener('click', function() {
        load_email(url)
        archive(url)
        reply(url)
          //update read to true
        fetch(url, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
         })
          console.log('This element has been clicked!')
      });
      document.querySelector('#container').append(element);
    });
    
  });

  }


//load sent emails
if (mailbox == 'sent') {

  document.querySelector('#container').innerHTML ='';
  
  fetch('/emails/sent')
  .then(response => response.json())
  .then(emails => {
  //print sent emails
  emails.forEach(function(value, index) {
    const li = document.createElement('div');
    li.innerHTML = `<b>Email ID:</b> ${emails[index].id}   <b>From:</b> ${emails[index].sender} <b>Subject:</b> ${emails[index].subject} <b>Timestamp:</b> ${emails[index].timestamp}`;
    li.className = "list-group-item";
    //li.style.border = "thin solid black";
    document.querySelector('#container').append(li);
    
    const url = `/emails/${emails[index].id}`;
    li.addEventListener('click', function() {
      load_email(url)
      //if archive, unarchive(url)
      reply(url)
      

    })
  })
  console.log(emails);
  });
}

//load archived emails
if (mailbox == 'archive') {
  document.querySelector('#container').innerHTML ='';

  fetch('/emails/archive')
  .then(response => response.json())
  .then(emails => {
    emails.forEach(function(value, index) {
      const li = document.createElement('div');
      li.innerHTML = `${emails[index].id} From: ${emails[index].sender} Subject: ${emails[index].subject}  Read: ${emails[index].read}`;
      li.className = "list-group-item";
      //li.style.border = "thin solid black";
      document.querySelector('#container').append(li);
      const url = `/emails/${emails[index].id}`;
      
      li.addEventListener('click', function() {
        load_email(url)
        unarchive(url)
        reply(url)
        // fetch(url)
        // .then(response => response.json())
        // .then(email => {
        // // Print email
        // document.querySelector('#container').innerHTML = `${email.id} Body: ${email.body}`;
        // //archive button
        // unarchive(url)
        // //reply button
        // reply(url)
        // })
      })
    })
  })


}


}
