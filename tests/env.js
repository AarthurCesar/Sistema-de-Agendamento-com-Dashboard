// Carregado via `node --import` ANTES de qualquer outro módulo.
// Garante que os testes usem o banco de teste (.env.test), com override.
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test', override: true });
