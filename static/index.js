document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    //////////////////////// New Room /////////////////////////////////////////////

    // By default, submit button is disabled
    document.querySelector('#submitRoom').disabled = true;

    // Enable button only if there is text in the input field
    document.querySelector('#name').onkeyup = () => {
        if (document.querySelector('#name').value.length > 0)
            document.querySelector('#submitRoom').disabled = false;
        else
            document.querySelector('#submitRoom').disabled = true;
    };    

    // Listen for new room submission
    socket.on('connect', () => {
        document.querySelector('#newRoom').onsubmit = () => {   
            const newRoom = document.querySelector('#name').value;   
            
            // Clear input field and disable button again
            document.querySelector('#name').value = '';
            document.querySelector('#submitRoom').disabled = true; 

            socket.emit('create room', {'newRoom': newRoom});
            return false;
        };           
    });
        
    // When a new room is announced, add to the unordered list
    socket.on('announce room', data => {

        if (data.roomTaken){
            // alert("Room already exists")
        }
        else
        {
            // Create new item for list
            const li = document.createElement('li');
            li.innerHTML = `<li id=${data.selection}><a href="${data.selection}">${data.selection}</a></li>`        
            
            // Add new item to chat room list
            document.querySelector('#rooms').append(li);
        }                       
                    
    });


    //////////////////////// New Message /////////////////////////////////////////////

    // By default, submit button is disabled
    document.querySelector('#submitMessage').disabled = true;

    // Enable button only if there is text in the input field
    document.querySelector('#message').onkeyup = () => {        
        if (document.querySelector('#message').value.length > 0)
            document.querySelector('#submitMessage').disabled = false;
        else
            document.querySelector('#submitMessage').disabled = true;
    };    

    // Listen for new message submission
    socket.on('connect', () => {
        document.querySelector('#newMessage').onsubmit = () => {               
            const newMessage = document.querySelector('#message').value;
            const room = document.querySelector('#message').getAttribute("room"); 
            
            // Clear input field and disable button again
            document.querySelector('#message').value = '';
            document.querySelector('#submitMessage').disabled = true;

            socket.emit('create message', {'newMessage': newMessage, 'room': room});
            return false;
        };           
    });
        
    // When a new message is announced, add to the unordered list
    socket.on('announce message', data => {

        const room = document.querySelector('#message').getAttribute("room");
        const currentRoom = data.room;

        if (currentRoom == room){
            
            // Create new message item for list
            var li = document.createElement('li');
            // li.innerHTML = `<li id=${data.message}><a href="${data.message}"> <h4>${data.user}:</h4> ${data.message}</a></li>`        
            li.innerHTML = `<li id=${data.message}><h4>${data.user}:</h4> ${data.message}</li>`        
            
            // Add new item to messages list
            document.querySelector('#messages').append(li);

            // Move chat window down
            const chatWindow = document.querySelector(".chat");
            // chatWindow.scrollTop = chatWindow.scrollHeight - chatWindow.clientHeight;
        }                
                   
    });    

    //////////////////////// Change Room /////////////////////////////////////////////

    // Listen for room selection 
    document.querySelectorAll('.room').forEach(function(li) {
        li.onclick = function() {
            const request = new XMLHttpRequest();
            const roomSelected = li.dataset.roomname;
            request.open('POST', '/changeRoom')

            // Callback function for when request completes
            request.onload = () => {
                
                const data = JSON.parse(request.responseText)
                                                
                document.getElementById("message").setAttribute("room", data.room)  
                document.getElementById("messages").innerHTML = ""              
                

                Object.keys(data.messages).forEach(function(key) {
                    
                    var message = key;
                    var user = data.messages[key];
                    // document.getElementById("messages").innerHTML += ("<li>"+"<h4>"+user+":"+"</h4>"+" "+message+"</li>")

                    // Create new message item for list
                    var li = document.createElement('li');
                            
                    li.innerHTML = `<li id="chatmessage"><h4>${user}:</h4> ${message}</li>`        
                    
                    // Add new item to messages list
                    document.querySelector('#messages').append(li);

                });                              
            }

            // Add data to send with request 
            const data = new FormData();
            data.append("room", roomSelected);

            // Send request 
            request.send(data);
            return false;

        };
    }); 
                
});
