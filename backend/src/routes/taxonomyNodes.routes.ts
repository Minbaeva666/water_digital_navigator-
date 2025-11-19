import express from "express";
import {getTaxonomyNodes, getTaxonomyNodeStructure, updateTaxonomyNodes} from "../controllers/taxonomyNodes.controller";

const router = express.Router();

router.post('/', updateTaxonomyNodes);
router.get('/', getTaxonomyNodes);
router.get("/taxonomy-structure", getTaxonomyNodeStructure);


export default router;