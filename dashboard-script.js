let currentAccount = null;
let transactions = [];

// Verificar se existe conta logada
window.addEventListener('load', function () {
    const accountData = localStorage.getItem('currentAccount');
    if (!accountData) {
        window.location.href = 'index.html';
        return;
    }

    currentAccount = JSON.parse(accountData);
    transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    loadAccountInfo();
    loadTransactions();
});

function loadAccountInfo() {
    document.getElementById('clientName').textContent = currentAccount.client.name;
    document.getElementById('accountNumber').textContent = currentAccount.accountNumber;
    // document.getElementById('accountType').textContent = currentAccount.accountType;
    document.getElementById('currentBalance').textContent = `MZN${currentAccount.balance.toFixed(2)}`;
    // console.log(currentAccount.client.name);
    // updateBalance();
}

function updateBalance() {
    document.getElementById('currentBalance').textContent = `MZN${currentAccount.balance.toFixed(2)}`;
}

function showMessage(text, type) {
    const message = document.getElementById('message');
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = 'block';

    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}

function addTransaction(type, amount, description = '') {
    const transaction = {
        id: Date.now(),
        type: type,
        amount: amount,
        date: new Date().toLocaleString('pt-PT'),
        description: description
    };

    transactions.unshift(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    loadTransactions();
}

function loadTransactions() {
    const transactionsList = document.getElementById('transactionsList');

    if (transactions.length === 0) {
        transactionsList.innerHTML = '<p class="no-transactions">Nenhuma transação realizada</p>';
        return;
    }

    transactionsList.innerHTML = transactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-type">${transaction.type}</div>
                <div class="transaction-date">${transaction.date}</div>
                ${transaction.description ? `<div class="transaction-description">${transaction.description}</div>` : ''}
            </div>
            <div class="transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}">
                MZN${Math.abs(transaction.amount).toFixed(2)}
            </div>
        </div>
    `).join('');
}

function deposit() {
    const amount = parseFloat(document.getElementById('depositAmount').value);

    if (!amount || amount <= 0) {
        showMessage('Por favor, insira um valor válido para depósito', 'error');
        return;
    }

    fetch(`http://localhost:8080/api/bank-accounts/${currentAccount.accountNumber}/deposit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(amount)
    }).then(response => {
        if (!response.ok) {
            showMessage('Erro ao realizar depósito', 'error');
        }
    });

    currentAccount.balance += amount;
    localStorage.setItem('currentAccount', JSON.stringify(currentAccount));

    addTransaction('Depósito', amount);
    updateBalance();

    document.getElementById('depositAmount').value = '';
    showMessage(`Depósito de ${amount.toFixed(2)} MZN realizado com sucesso`, 'success');
}

function withdraw() {
    const amount = parseFloat(document.getElementById('withdrawAmount').value);

    if (!amount || amount <= 0) {
        showMessage('Por favor, insira um valor válido para levantamento', 'error');
        return;
    }

    if (amount > currentAccount.balance) {
        showMessage('Saldo insuficiente para esta operação', 'error');
        return;
    }
    fetch(`http://localhost:8080/api/bank-accounts/${currentAccount.accountNumber}/withdraw`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(amount)
    }).then(response => {
        if (!response.ok) {
            showMessage('Erro ao realizar levantamento', 'error');
        }
    });

    currentAccount.balance -= amount;
    localStorage.setItem('currentAccount', JSON.stringify(currentAccount));

    addTransaction('Levantamento', -amount);
    updateBalance();

    document.getElementById('withdrawAmount').value = '';
    showMessage(`Levantamento de ${amount.toFixed(2)} MZN realizado com sucesso`, 'success');
}

function transfer() {
    const targetAccount = document.getElementById('transferAccount').value.trim();
    const amount = parseFloat(document.getElementById('transferAmount').value);

    if (!targetAccount) {
        showMessage('Por favor, insira o número da conta destino', 'error');
        return;
    }

    if (!amount || amount <= 0) {
        showMessage('Por favor, insira um valor válido para transferência', 'error');
        return;
    }

    if (amount > currentAccount.balance) {
        showMessage('Saldo insuficiente para esta transferência', 'error');
        return;
    }

    if (targetAccount === currentAccount.accountNumber) {
        showMessage('Não é possível transferir para a mesma conta', 'error');
        return;
    }
    fetch(`http://localhost:8080/api/bank-accounts/${currentAccount.accountNumber}/transfer`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            accountNumberTo: targetAccount,
            amount: amount
        })
    }).then(response => {
        if (!response.ok) {
            showMessage('Erro ao realizar transferência', 'error');
        }
    });
    currentAccount.balance -= amount;
    localStorage.setItem('currentAccount', JSON.stringify(currentAccount));

    addTransaction('Transferência', -amount, `Para conta: ${targetAccount}`);
    updateBalance();

    document.getElementById('transferAccount').value = '';
    document.getElementById('transferAmount').value = '';
    showMessage(`Transferência de ${amount.toFixed(2)} MZNpara conta ${targetAccount} realizada com sucesso`, 'success');
}

function printStatement() {
    const printWindow = window.open('', '_blank');
    const printContent = `
        <html>
        <head>
            <title>Extrato Bancário</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .account-info { margin-bottom: 20px; }
                .transactions { margin-top: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .positive { color: green; }
                .negative { color: red; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Extrato Bancário</h1>
                <p>Data: ${new Date().toLocaleString('pt-PT')}</p>
            </div>
            <div class="account-info">
                <p><strong>Cliente:</strong> ${currentAccount.clientName}</p>
                <p><strong>Conta:</strong> ${currentAccount.accountNumber}</p>
                <p><strong>Saldo Atual:</strong> MZN${currentAccount.balance.toFixed(2)}</p>
            </div>
            <div class="transactions">
                <h2>Histórico de Transações</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Tipo</th>
                            <th>Descrição</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactions.map(t => `
                            <tr>
                                <td>${t.date}</td>
                                <td>${t.type}</td>
                                <td>${t.description || '-'}</td>
                                <td class="${t.amount > 0 ? 'positive' : 'negative'}">MZN${Math.abs(t.amount).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </body>
        </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

function establishingConnection() {
    let socket = new SockJS('http://localhost:8080/ws');
    let stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        console.log('Conectado: ' + frame);
        stompClient.subscribe('/topic/transaction/' + currentAccount.accountNumber, function (message) {
            const msg = message.body;
            console.log("Received via WebSocket: " + msg);
            addNotification(msg);
        });
    });
}

function logout() {
    localStorage.removeItem('currentAccount');
    localStorage.removeItem('transactions');
    window.location.href = 'index.html';
}

//===========Notifications============
const notificationIcon = document.getElementById('notification-icon');
const notificationBox = document.getElementById('notification-box');
const notificationList = document.getElementById('notification-list');
const notificationCount = document.getElementById('notification-count');

let unreadCount = 0;

notificationIcon.addEventListener('click', () => {
    notificationBox.style.display = notificationBox.style.display === 'block' ? 'none' : 'block';
    const items = notificationList.querySelectorAll('li.new');
    items.forEach(item => {
        item.classList.remove('new');
    });
    unreadCount = 0;
    notificationCount.innerText = unreadCount;
});

function addNotification(msg) {
    const li = document.createElement('li');
    li.innerText = msg;
    li.classList.add('new');
    notificationList.insertBefore(li, notificationList.firstChild);
    unreadCount++;
    notificationCount.innerText = unreadCount;
}
establishingConnection();