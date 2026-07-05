/**
 * Category Routes
 */

import { Router} from 'express';
import { CategoryController} from '../controllers/category.controller';

export const categoryRoutes = Router();

categoryRoutes.post('/', CategoryController.create);
categoryRoutes.get('/', CategoryController.getAll);
categoryRoutes.put('/reorder', CategoryController.reorder);
categoryRoutes.get('/:id', CategoryController.getById);
categoryRoutes.put('/:id', CategoryController.update);
categoryRoutes.patch('/:id/deactivate', CategoryController.deactivate);
categoryRoutes.delete('/:id', CategoryController.delete);




