document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // By default, submit button is disabled
    document.querySelector('#submitRoom').disabled = true;

    // Enable button only if there is text in the input field
    document.querySelector('#name').onkeyup = () => {
        if (document.querySelector('#name').value.length > 0)
            document.querySelector('#submitRoom').disabled = false;
        else
            document.querySelector('#submitRoom').disabled = true;
    };    

    document.querySelector('#newRoom').onsubmit = () => {   
        
        socket.on('connect', () => {
            const newRoom = document.querySelector('#name').value;
            socket.emit('create room', {'newRoom': newRoom });            
        });
        return false;
    };              
        
    // When a new room is announced, add to the unordered list
    socket.on('announce room', data => {
        
        // Create new item for list
        const li = document.createElement('li');
        li.innerHTML = `<li id=${data.selection}><a href="${data.selection}">${data.selection}</a></li>`        
        
        // Add new item to chat room list
        document.querySelector('#rooms').append(li);
        
        // Clear input field and disable button again
        document.querySelector('#name').value = '';
        document.querySelector('#submitRoom').disabled = true;                 
    });
});