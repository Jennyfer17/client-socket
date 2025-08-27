import { currentAccount } from "./dashboard-script";

let socket = new SockJS('http://localhost:8080/ws');
let stompClient = Stomp.over(socket);

stompClient.connect({}, function(frame) {
    console.log('Conectado: ' + frame);

    stompClient.subscribe('/topic/transaction/' + currentAccount.accountNumber, function(message) {
        const msg = message.body;
        console.log("Hey" + message)
        console.log("Hello")
        console.log("Received via WebSocket: " + msg);
    });
});

