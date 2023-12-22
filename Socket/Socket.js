const socket = require("socket.io");
const { socketEvents } = require("../Util/socketUtils");
class Socket {
  io;
  mainSocket;
  onlineUsers;
  constructor(server, origin = process.env.SOCKET_CONNECTION) {
    this.io = socket(server, {
      cors: {
        origin: "http://localhost:3000",
        // process.env.NODE_ENV === "development"
        //   ? process.env.SOCKET_CONNECTION_DEV
        //   : origin,
        credentials: true,
      },
    });
    this.onlineUsers = new Map();
    this.init();
  }
  /**
   * this method will create the connection of the socket
   * @returns this
   */

  init() {
    this.io.on(socketEvents["createConnection"], (websocket) => {
      this.mainSocket = websocket;
      this.addUser(websocket);
      this.receiveMessages(websocket);
     
    });

    return this;
  }

  /**
   * This will add the user in map of user
   */
  addUser(socket) {
    socket.on(socketEvents["addUser"], (userId) => {
      this.onlineUsers.set(userId, socket.id);
    });
  }

  /**
   * this method will start sending the messages to receiver
   * @returns this
   */

  receiveMessages(websocket) {
    websocket.on(socketEvents["sendMessage"], (data) => {
      const sendUserSocket = this.onlineUsers.get(data.to);

      if (sendUserSocket) {
        websocket.to(sendUserSocket).emit(socketEvents["receiveMessage"], data);

        // websocket.to(sendUserSocket).emit(socketEvents["receiveMessage"], data);
      }
    });
    return this;
  }
}

module.exports = Socket;
