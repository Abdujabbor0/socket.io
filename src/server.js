import express from "express"
import path from "path"
import fileUpload from "express-fileupload"
import { createServer } from "http"
import { Server } from "socket.io"
const PORT = process.env.PORT || 1111

const app = express()

app.set('views', path.join(process.cwd(), 'src', 'views'))

app.use( (req, res, next) => {
    res.render = function (htmlName) {
        return res.sendFile(path.join( app.get('views'), htmlName + '.html'))
    }

    return next()
})

app.use(fileUpload());


app.use(express.static(path.join(process.cwd(), 'src', 'public') ) )
app.use(express.static(path.join(process.cwd(), 'uploads') ) )

app.get('/',(req,res) => res.render('index'))
app.get('/login',(req,res) => res.render('login'))
app.post('/login', async (req, res) => {
    const { file } = req.files
    let filename = file.name.replace(/\s/g,'')

    await file.mv(path.join(process.cwd(), 'uploads', filename) )

    return res.json({
        username: req.body.username,
        imgPath: '/' + filename,
    })
})

const httpServer = createServer(app)
const io = new Server(httpServer)

let users = []
io.on("connection", (socket) => {
    const { username, img } = socket.handshake.headers 
    let newUser = {
        id: socket.id,
        username,
        img
    }
    users.push(newUser)

    io.emit('user connected', users)

    socket.on('new message', data => {
        socket.broadcast.emit('new message', data)
    }) 

    // socket.on('start typing', data => {
    //     socket.broadcast.emit('start typing', data)
    // })

    // socket.on('end typing', data => {
    //     socket.broadcast.emit('end typing')
    // })

    socket.on('disconnect', () => {
        let index = users.findIndex(user => user.id == socket.id)
        if(index != -1) {
            users.splice(index, 1)
        }
        io.emit('user disconnected', users)
    })
})

httpServer.listen(PORT, () => console.log('Server is running on http://localhost:' + PORT))