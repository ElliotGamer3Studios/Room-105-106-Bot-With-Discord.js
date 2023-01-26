import json
import socket
import sys
import os
import time
import base64
from math import ceil
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

#if the --host option is used, the host is set to the value of the option
if "--host" in sys.argv:
    host = sys.argv.index('--host') + 1

#if the client is run using the --port option, the port number is set to the value of the option
if "--port" in sys.argv:
    port = sys.argv.index('--port') + 1

if "--suppress" in sys.argv:
    suppressed = True
else:
    suppressed = False

#get the host from the ../json/auth.json file
with open('./json/auth.json') as f:
    data = json.load(f)
    host = data['AI_Host']
    port = data['AI_Port']
s.connect((host, port))

def wait_for_ready(server):
    if not suppressed: print("Waiting for server to be ready...")
    while not server.recv(1024).decode().startswith("READY"):
        pass
    if not suppressed: print("Received READY message from server")

def send_ready(server):
    if not suppressed: print("Sending READY message to server...")
    server.send("READY".encode())

def send_message(server, message):
    if not suppressed: print("Sending message to server...")
    server.send(message.encode())

def wait_for_ack(server):
    if not suppressed: print("Waiting for acknowledgement from server...")
    ackmsg = server.recv(1024).decode()
    while not ackmsg.startswith("ACK"):
        pass
    if not suppressed: print("Received acknowledgement from server")
    return ackmsg

def wait_for_size(server):
    if not suppressed: print("Waiting for SIZE of response...")
    size = server.recv(1024).decode() #get the message from the server
    while not size.startswith("SIZE"):
        pass
    if not suppressed: print( "Received size of response: " + str(size))
    return int(size[4:]) #return the size of the image

def wait_for_text(server, size):
    if not suppressed: print("Waiting for text from server...")
    text = server.recv(size).decode()
    while not text.startswith("TEXT"):
        pass
    if not suppressed: print("Received text from server: " + text)
    return text[4:]

def wait_for_server_to_generate_image(server):
    if not suppressed: print("Waiting for server to generate image...")
    wait_for_ready(server)
    if not suppressed: print("Received READY message from server")

def wait_for_image(server, size):
    if not suppressed: print("Receiving image from server...")
    recvmsg = server.recv(size) #get the message from the server
    while len(recvmsg) < size:
        recvmsg += server.recv(size - len(recvmsg))
    if not suppressed: print("Received image from server")
    return recvmsg

def convert_image(recvmsg):
    filename = "temp.png"
    #convert the base64 image to a file
    if not suppressed: print("Converting image from base64...")
    with open('./media/image/'+filename, "wb") as fh:
        fh.write(base64.decodebytes(recvmsg))

    return filename

#def display_image(filename):
    #display the image
    #if not suppressed: print("Displaying image...")
    #os.system('start ./images/' + filename)

sendmsg = ""
i=1
while i and sendmsg != "QUIT":
    i-=1 #decrement i so that the loop only runs once
    #get the message that was from the user in the command line
    if "--message" in sys.argv:
        sendmsg = sys.argv[sys.argv.index('--message') + 1]
    else:
        sendmsg = input("Enter a message: ")

    #send the message to the server
    send_message(s, sendmsg)

    #wait for the acknowledgement from the server
    ackmsg = wait_for_ack(s)
    #if server tells client to quit, break out of the loop
    if ackmsg == "ACK QUIT":
        if not suppressed: print("Server sent ACK QUIT message. Closing connection...")
        break
    #if the message is TEXT, wait for the server to send the text
    elif ackmsg == "ACK TEXT":
        wait_for_ready(s) #wait for the server to be ready to send the text
        size = wait_for_size(s) #wait for the server to send the size of the text
        send_ready(s) #tell the server that the client is ready to receive the text
        text = wait_for_text(s, size) #receive the text from the server
        if not suppressed: print(text)

    #if the message is IMAGE, wait for the server to send the image
    elif ackmsg == "ACK IMAGE":
        wait_for_server_to_generate_image(s) #wait for the server to generate the image
        size=wait_for_size(s) #wait for the server to send the size of the image
        send_ready(s) #tell the server that the client is ready to receive the image
        recvmsg = wait_for_image(s, size) #receive the image from the server
        filename = convert_image(recvmsg) #convert the base64 image to a file
        #display_image(filename) #display the image
    #if the message is not TEXT or IMAGE, if not suppressed: print the generic ACK message
    else:
        if not suppressed: print("Generic ACK")
        if not suppressed: print("ACK: " + ackmsg)

    send_ready(s) #tell the server that the client is ready to send the next message

send_message(s, "QUIT") #send the QUIT message to the server
s.close() #close the socket
print("Done")