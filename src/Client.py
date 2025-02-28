import os
import socket

def main(dest_ip, dest_port):
    #Creating an IPV4 Socket
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    
    #Connecting to the server IPV4
    try:
        s.connect((dest_ip, dest_port))
    except Exception as e:
        print(f"Error connecting to server: {e}")
        return
    
    #Infinite loop to communicate with the server
    while True:
        msg = input().strip()

        if not msg:
            continue

        if msg.lower() == 'quit':
            break
        
        msg = msg.encode('utf-8', errors='replace')
        s.send(msg)
        
        #Printing the recieved message
        try:
            data = s.recv(4096)
            print(f"{data.decode()}")
        except Exception as e:
            print(f"Error receiving data: {e}")
            break

    s.close()
    print("Connection closed.")

if __name__ == "__main__":
    dest_ip = os.getenv("DEST_IP", "app") 
    dest_port = int(os.getenv("DEST_PORT", "5555")) 
    main(dest_ip, dest_port)

