/**
 * Transaction Routes
 */

import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller.js';

export const transactionRoutes = Router();

transactionRoutes.post('/', TransactionController.create);
transactionRoutes.get('/', TransactionController.getAll);
transactionRoutes.get('/:id', TransactionController.getById);
transactionRoutes.put('/:id', TransactionController.update);
transactionRoutes.delete('/:id', TransactionController.delete);




