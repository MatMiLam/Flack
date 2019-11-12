document.addEventListener('DOMContentLoaded', () => {
        
    // Connect to websocket
    // var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port, {transports: ['websocket']});    
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
            
            li.dataset.roomname = data.selection;
            li.className = ("room", "room"); 
            li.id = data.selection;           
            li.innerHTML = `<a href="${data.selection}">${data.selection} <i class="far fa-comments icon"></i></a>`;  
                
            
            li.onclick = function() {
                
                const request = new XMLHttpRequest();
                const roomSelected = li.dataset.roomname;
                request.open('POST', '/changeRoom')
    
                // Callback function for when request completes
                request.onload = () => {
                    
                    const data = JSON.parse(request.responseText) 
                                              
                    // Clear the new message notification 
                    document.querySelector(`#rooms > #${roomSelected} > a > i`).style.color = "#fff";
                    
                    document.getElementById("message").setAttribute("room", data.room);  
                    document.getElementById("messages").innerHTML = "";                                  
                    document.querySelector('#message').setAttribute("placeholder", `You are in the ${data.room} Chatroom`);              
                    document.querySelector('#message').disabled = false;  
                                                                
                    // Loop throuth the array of dicts 
                    data.messages.forEach(function(element) {                    

                        for (var key in element){                        
                            var user = key;
                            var message = element[key][0];
                            var dateTime = element[key][1];
                        }
                                                                                
                        // Create new message item for list
                        var li = document.createElement('li');
                        li.id = "chatmessage";         
                                
                        li.innerHTML = `<h6>${dateTime}</h6><h4> ${user}:</h4>  ${message}`;             
                        
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
            li.id = "chatmessage";         
                
            li.innerHTML = `<h6>${data.timeStamp}</h6><h4>${data.user}:</h4> ${data.message}`           
            
            // Add new item to messages list
            document.querySelector('#messages').append(li);

            // Move chat window down
            const chatWindow = document.querySelector(".chat");
            chatWindow.scrollTop = chatWindow.scrollHeight - chatWindow.clientHeight;
        }  
        else {
            
            document.querySelector(`#rooms > #${currentRoom} > a > i`).style.color = "rgb(49, 209, 97)";
        }              
                   
    });    

    //////////////////////// Change Room /////////////////////////////////////////////

    // Listen for room selection 
    document.querySelectorAll('.room').forEach(function(li) {
        li.onclick = function() {  
                          
            const request = new XMLHttpRequest();
            const roomSelected = li.dataset.roomname;
            const oldRoom = document.querySelector('#message').getAttribute("room");

            request.open('POST', '/changeRoom')

            // Callback function for when request completes
            request.onload = () => {
                
                const data = JSON.parse(request.responseText)     
                
                // Clear the new message notification 
                document.querySelector(`#rooms > #${roomSelected} > a > i`).style.color = "#fff";
                                                
                document.getElementById("message").setAttribute("room", data.room);  
                document.getElementById("messages").innerHTML = "";                                  
                document.querySelector('#message').setAttribute("placeholder", `You are in the ${data.room} Chatroom`);              
                document.querySelector('#message').disabled = false;  
                                                              
                // Loop throuth the array of dicts 
                data.messages.forEach(function(element) {                    

                    for (var key in element){                        
                        var user = key;
                        var message = element[key][0];
                        var dateTime = element[key][1];
                    }
                                                                               
                    // Create new message item for list
                    var li = document.createElement('li');  
                    li.id = "chatmessage";         
                          
                    li.innerHTML = `<h6>${dateTime}</h6><h4> ${user}:</h4>  ${message}`;   
                    
                    // Add new item to messages list
                    document.querySelector('#messages').append(li);

                });                                    
            }

            // Add data to send with request 
            const data = new FormData();
            data.append("room", roomSelected);
            data.append("oldRoom", oldRoom);

            // Send request 
            request.send(data);
            return false;

        };
    }); 

    // Announce when a user has entered the room 
    socket.on('enter room', data => {
        const room = document.querySelector('#message').getAttribute("room");
        const currentRoom = data.room;
        const oldRoom = data.oldRoom;
        const currentUser = data.currentUser;
        
        if (currentRoom == room && oldRoom != room){
            
            // Create new message item for list
            var li = document.createElement('li');
            li.id = "enter";          
            
            li.innerHTML = `<h4>${currentUser} has entered the ${currentRoom} chat room</h4>`;  

            // Add new item to messages list
            document.querySelector('#messages').append(li);
        }  
        
        // Announce when a user has left the room
        // if (oldRoom == room && oldRoom != ""){
            
        //     // Create new message item for list
        //     var li = document.createElement('li');
        //     li.id = "leave";          
                
        //     li.innerHTML = `<h4>${currentUser} has left the ${oldRoom} chat room</h4>`;  
                 
        //     // Add new item to messages list
        //     document.querySelector('#messages').append(li);     
        // }  

        // Move chat window down
        const chatWindow = document.querySelector(".chat");
        chatWindow.scrollTop = chatWindow.scrollHeight - chatWindow.clientHeight;

    });                   
});
