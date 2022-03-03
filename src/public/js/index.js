const username = window.localStorage.getItem('username')
const img = window.localStorage.getItem('img')

if(!username || !img) window.location = '/login'

const socket = io({
	transportOptions: {
        polling: {
            extraHeaders: {
                username,
                img,
            }
        }
    }
})

socket.on('connect', () => {
	window.localStorage.setItem('socketId', socket.id)
})

socket.on('user connected', (data) => renderUsers(data))
socket.on('user disconnected', (data) => renderUsers(data))
socket.on('new message', (data) => renderMessage(data))

// socket.on('start typing', (data) => {
// 	header.textContent = data.username + ' is typing...'
// })
// socket.on('end typing', (data) => {
// 	header.textContent = ''
// })

let timeOutId
textArea.onkeyup = event => {
	// socket.emit('start typing', {
	// 	id: socket.id,
	// 	username,
	// })


	// clearTimeout(timeOutId)
	// timeOutId = setTimeout( () => {
	// 	socket.emit('end typing')
	// }, 1000)
	

	if(event.keyCode != 13 || !textArea.value.trim() || textArea.value.length > 15) return

	socket.emit('new message', {
		id: socket.id,
		username,
		img,
		text: textArea.value.trim()
	})


	chatBox.innerHTML += ` 
		<li class="chat-right">
            <div class="chat-text">${textArea.value}</div>
            <div class="chat-avatar">
                <img src="${img}" alt="Retail Admin">
                <div class="chat-name">${username}</div>
            </div>
        </li>
	`
	textArea.value = ''.trim()
	textArea.blur()
}



function renderUsers (users) {
    console.log(users)
	usersList.innerHTML = null
	for(let i in users) {
		if(window.localStorage.getItem('socketId') == users[i].id) continue
		usersList.innerHTML += ` 
			<li class="person" data-chat="person${i + 1}">
                <div class="user">
                    <img src="${users[i].img}">
                </div>
                <p class="name-time">
                    <span class="name">${users[i].username}</span>
                </p>
            </li>
		`
	}
}

function renderMessage (message) {
	chatBox.innerHTML += ` 
		<li class="chat-left">
            <div class="chat-avatar">
                <img src="${message.img}" alt="Retail Admin">
                <div class="chat-name">${message.username}</div>
            </div>
            <div class="chat-text">${message.text}</div>
        </li>
	`
}