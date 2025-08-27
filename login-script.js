// Dados simulados das contas
const accounts = {
    '12345': {
        accountNumber: '12345',
        clientName: 'João Silva',
        balance: 2500.00,
        accountType: 'Conta Corrente',
        creationDate: '2023-01-15',
        status: 'Ativa',
        address: {
            country: 'Portugal',
            city: 'Lisboa',
            postalCode: '1000-001'
        }
    },
    '67890': {
        accountNumber: '67890',
        clientName: 'Maria Santos',
        balance: 1800.50,
        accountType: 'Conta Poupança',
        creationDate: '2023-03-20',
        status: 'Ativa',
        address: {
            country: 'Portugal',
            city: 'Porto',
            postalCode: '4000-001'
        }
    },
    '11111': {
        accountNumber: '11111',
        clientName: 'Pedro Costa',
        balance: 5000.00,
        accountType: 'Conta Corrente',
        creationDate: '2022-12-10',
        status: 'Ativa',
        address: {
            country: 'Portugal',
            city: 'Coimbra',
            postalCode: '3000-001'
        }
    }
};

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const accountNumber = document.getElementById('accountNumber').value.trim();
    const errorMessage = document.getElementById('errorMessage');
    
    if (accounts[accountNumber]) {
        // Guardar dados da conta no localStorage
        localStorage.setItem('currentAccount', JSON.stringify(accounts[accountNumber]));
        
        // Redirecionar para o dashboard
        window.location.href = 'dashboard.html';
    } else {
        // Mostrar mensagem de erro
        errorMessage.style.display = 'block';
        document.getElementById('accountNumber').value = '';
        
        // Esconder mensagem de erro após 3 segundos
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }
});

// Limpar dados ao carregar a página
window.addEventListener('load', function() {
    localStorage.removeItem('currentAccount');
    localStorage.removeItem('transactions');
});