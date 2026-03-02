import { getAllProductsController, getProductByIdController, getProductsByCategoryController, createProductController } from "../controllers/productController.js";
import { Router } from "express";

const router = Router();

router.get("/", getAllProductsController);
router.get("/:id", getProductByIdController);
router.get("/category/:category", getProductsByCategoryController);
router.post("/", createProductController);

export default router;