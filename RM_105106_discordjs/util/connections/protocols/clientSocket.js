//a class that acts as a client of the host on the specified port
//it can send and receive data from the server
//it can also close the connection
const net = require('net');

module.exports = class ClientSocket
{
    constructor(host, port)
    {
        this.port = port;
        this.host = host;
        this.socket = new net.Socket();
        this.socket.setTimeout(10000);
        this.socket.setKeepAlive(true, 10000);
        this.socket.connect(this.port, host, () =>
        {
            //send an event to our self to indicate that we are connected
            this.socket.emit('connected');
        }).on('error', (error) => console.log(error));
    }

    //send data to the server
    sendData(data)
    {
        this.socket.write(data);
    }

    //receive data from the server and return it
    receiveData()
    {
        return new Promise((resolve, reject) =>
        {
            this.socket.on('data', (data) =>
            {
                resolve(data);
            });
        });
    }

    //close the connection
    closeConnection()
    {
        this.socket.end();
    }
};
