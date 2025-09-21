import app from './app';
import { testConnection } from './models/Database';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await testConnection();
    
    app.listen(PORT, () => {
      console.log(`Servidor JuraShow rodando na porta ${PORT}`);
      console.log(`Acesse: http://localhost:${PORT}`);
      console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('❌ Falha ao inicializar o servidor:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  console.log('🛑 Servidor sendo encerrado...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Servidor sendo encerrado...');
  process.exit(0);
});

startServer();