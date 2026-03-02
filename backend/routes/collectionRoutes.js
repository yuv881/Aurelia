import { getAllCollectionsController, getCollectionByIdController, createCollectionController, updateCollectionController, deleteCollectionController, getCollectionProductsController } from "../controllers/collectionController.js";
import { Router } from "express";

const router = Router();

router.get("/", getAllCollectionsController);
router.get("/:id", getCollectionByIdController);
router.post("/", createCollectionController);
router.put("/:id", updateCollectionController);
router.delete("/:id", deleteCollectionController);
router.get("/:collectionId/products", getCollectionProductsController);

export default router;